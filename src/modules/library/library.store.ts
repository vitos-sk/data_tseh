import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from '@/platform/storage'

export interface LastOpened {
  postId: string
  at: number
}

interface LibraryState {
  /** id сохранённых постов, в порядке добавления */
  saved: string[]
  lastOpened: LastOpened | null
  /** Данные из хранилища доехали. До этого закладки показывать нельзя. */
  hydrated: boolean

  toggleSaved: (postId: string) => void
  setLastOpened: (postId: string) => void
  clearSaved: () => void
}

/**
 * Личное состояние пользователя. Знает только идентификаторы — про содержимое
 * постов здесь не должно быть ни слова, иначе связка с каталогом станет жёсткой.
 *
 * Прогресса чтения нет намеренно: пост читается за один заход, отмечать в нём
 * нечего (docs/decisions/0010).
 */
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      saved: [],
      lastOpened: null,
      hydrated: false,

      toggleSaved: (postId) =>
        set((s) => ({
          saved: s.saved.includes(postId)
            ? s.saved.filter((id) => id !== postId)
            : [postId, ...s.saved],
        })),

      setLastOpened: (postId) => set({ lastOpened: { postId, at: Date.now() } }),

      clearSaved: () => set({ saved: [], lastOpened: null }),
    }),
    {
      name: 'library',
      storage: createJSONStorage(() => storage),
      /*
       * Версия 3: курсы с уроками стали постами, идентификаторы сменились
       * вместе с таблицей. Сохранённое по старым id указывает в пустоту —
       * честнее очистить, чем показывать закладки на несуществующее.
       */
      version: 3,
      migrate: () => ({ saved: [], lastOpened: null }),
      partialize: ({ saved, lastOpened }) => ({ saved, lastOpened }),
      onRehydrateStorage: () => (state) => {
        // Вызывается и при успехе, и при ошибке: интерфейс не должен ждать вечно.
        useLibraryStore.setState({ hydrated: true })
        void state
      },
    },
  ),
)

/* — селекторы — */

export const selectIsSaved = (postId: string) => (s: LibraryState) => s.saved.includes(postId)
