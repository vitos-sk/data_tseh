import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from '@/platform/storage'

export interface LastOpened {
  courseId: string
  lessonId: string
  at: number
}

interface LibraryState {
  /** id сохранённых курсов, в порядке добавления */
  saved: string[]
  /** courseId → id пройденных уроков */
  completed: Record<string, string[]>
  lastOpened: LastOpened | null
  /** Данные из хранилища доехали. До этого прогресс показывать нельзя. */
  hydrated: boolean

  toggleSaved: (courseId: string) => void
  markLessonDone: (courseId: string, lessonId: string) => void
  markLessonUndone: (courseId: string, lessonId: string) => void
  setLastOpened: (courseId: string, lessonId: string) => void
  resetCourse: (courseId: string) => void
}

/**
 * Личное состояние пользователя. Знает только идентификаторы — про содержимое
 * курсов здесь не должно быть ни слова, иначе связка с каталогом станет жёсткой.
 */
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      saved: [],
      completed: {},
      lastOpened: null,
      hydrated: false,

      toggleSaved: (courseId) =>
        set((s) => ({
          saved: s.saved.includes(courseId)
            ? s.saved.filter((id) => id !== courseId)
            : [courseId, ...s.saved],
        })),

      markLessonDone: (courseId, lessonId) =>
        set((s) => {
          const done = s.completed[courseId] ?? []
          if (done.includes(lessonId)) return s
          return { completed: { ...s.completed, [courseId]: [...done, lessonId] } }
        }),

      markLessonUndone: (courseId, lessonId) =>
        set((s) => {
          const done = s.completed[courseId] ?? []
          return {
            completed: { ...s.completed, [courseId]: done.filter((id) => id !== lessonId) },
          }
        }),

      setLastOpened: (courseId, lessonId) =>
        set({ lastOpened: { courseId, lessonId, at: Date.now() } }),

      resetCourse: (courseId) =>
        set((s) => {
          const next = { ...s.completed }
          delete next[courseId]
          return {
            completed: next,
            lastOpened: s.lastOpened?.courseId === courseId ? null : s.lastOpened,
          }
        }),
    }),
    {
      name: 'library',
      storage: createJSONStorage(() => storage),
      partialize: ({ saved, completed, lastOpened }) => ({ saved, completed, lastOpened }),
      onRehydrateStorage: () => (state) => {
        // Вызывается и при успехе, и при ошибке: интерфейс не должен ждать вечно.
        useLibraryStore.setState({ hydrated: true })
        void state
      },
    },
  ),
)

/* — селекторы — */

/**
 * Общая пустая ссылка. Без неё селектор возвращал бы новый массив на каждый
 * вызов, useSyncExternalStore видел бы изменение и уходил в бесконечный рендер.
 */
const NO_LESSONS: readonly string[] = []

export const selectCompletedIds = (courseId: string) => (s: LibraryState) =>
  s.completed[courseId] ?? NO_LESSONS

export const selectIsSaved = (courseId: string) => (s: LibraryState) => s.saved.includes(courseId)

export const selectCompletedCount = (courseId: string) => (s: LibraryState) =>
  s.completed[courseId]?.length ?? 0

export const selectIsLessonDone = (courseId: string, lessonId: string) => (s: LibraryState) =>
  s.completed[courseId]?.includes(lessonId) ?? false

/** Доля пройденного, 0…1. Курс без уроков считаем непройденным, а не готовым. */
export function progressOf(completed: number, total: number): number {
  return total > 0 ? Math.min(1, completed / total) : 0
}
