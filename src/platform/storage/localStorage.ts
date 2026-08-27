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
      return true
    } catch {
      // Приватный режим или переполнение. Возвращаем отказ: вызывающий
      // сам решит, врать ли пользователю о сохранении.
      return false
    }
  },
  async removeItem(key) {
    try {
      localStorage.removeItem(PREFIX + key)
      return true
    } catch {
      return false
    }
  },
}
