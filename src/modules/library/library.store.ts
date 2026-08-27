import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { byteSize, MAX_VALUE_BYTES, storage } from '@/platform/storage'

export interface LastOpened {
  postId: string
  at: number
}

/**
 * Запас под служебную часть значения: имя ключа, номер версии, обёртка
 * zustand и lastOpened. Считаем щедро — лучше отказать на одну закладку
 * раньше, чем словить молчаливый отказ Telegram на записи.
 */
const OVERHEAD_BYTES = 320

export type SaveResult = 'saved' | 'removed' | 'full'

interface LibraryState {
  /** id сохранённых постов, в порядке добавления */
  saved: string[]
  lastOpened: LastOpened | null
  /** Данные из хранилища доехали. До этого закладки показывать нельзя. */
  hydrated: boolean

  /**
   * Возвращает исход, а не void: закладка может не поместиться в хранилище,
   * и интерфейс обязан об этом сказать, а не закрасить иконку впустую.
   */
  toggleSaved: (postId: string) => SaveResult
  setLastOpened: (postId: string) => void
  clearSaved: () => void
}

/**
 * Личное состояние пользователя. Знает только идентификаторы — про содержимое
 * постов здесь не должно быть ни слова, иначе связка с каталогом станет жёсткой.
 * Тела сохранённых постов лежат отдельно, в modules/catalog/catalog.cache.
 *
 * Прогресса чтения нет намеренно: пост читается за один заход, отмечать в нём
 * нечего (docs/decisions/0010).
 */
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      saved: [],
      lastOpened: null,
      hydrated: false,

      toggleSaved: (postId) => {
        const { saved } = get()

        if (saved.includes(postId)) {
          set({ saved: saved.filter((id) => id !== postId) })
          return 'removed'
        }

        const next = [postId, ...saved]
        // CloudStorage режет значения тяжелее 4 КБ и делает это молча.
        // Проверяем заранее: отказ, о котором сказали, лучше пропажи,
        // о которой не сказали.
        if (byteSize(JSON.stringify(next)) > MAX_VALUE_BYTES - OVERHEAD_BYTES) return 'full'

        set({ saved: next })
        return 'saved'
      },

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
