import type { KeyValueStore } from './types'

const PREFIX = 'tseh:'

/**
 * Запасной вариант для разработки в браузере и для случая, когда Telegram
 * не отдал CloudStorage. Приватный режим может бросать на записи — глушим.
 */
export const localStore: KeyValueStore = {
  async getItem(key) {
    try {
      return localStorage.getItem(PREFIX + key)
    } catch {
      return null
    }
  },
  async setItem(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value)
    } catch {
      /* приватный режим или переполнение — молча пропускаем */
    }
  },
  async removeItem(key) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* см. выше */
    }
  },
}
