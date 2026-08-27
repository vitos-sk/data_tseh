import { getWebApp } from '@/platform/telegram'
import type { KeyValueStore } from './types'

/** Telegram отказывает в записи значений тяжелее 4 КБ. */
export const MAX_VALUE_BYTES = 4096

/** Лимит считается в байтах, а не в символах: кириллица весит по два. */
export function byteSize(value: string): number {
  return new Blob([value]).size
}

/**
 * До версии 6.9 метода CloudStorage нет, и Telegram просто не вызывает колбэк.
 * Без таймаута гидратация стора зависла бы навсегда, а вместе с ней — весь прогресс.
 */
const TIMEOUT_MS = 3000

function withTimeout<T>(fallback: T, run: (done: (value: T) => void) => void): Promise<T> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (value: T) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(value)
    }
    const timer = setTimeout(() => finish(fallback), TIMEOUT_MS)
    run(finish)
  })
}

/**
 * Хранилище на стороне Telegram: данные привязаны к аккаунту и переезжают
 * между устройствами пользователя. Работает только внутри Telegram.
 */
export const cloudStorage: KeyValueStore = {
  getItem: (key) =>
    withTimeout<string | null>(null, (done) => {
      const cs = getWebApp()?.CloudStorage
      if (!cs) return done(null)
      cs.getItem(key, (err, value) => done(err ? null : (value ?? null)))
    }),

  setItem: (key, value) =>
    withTimeout<boolean>(false, (done) => {
      const cs = getWebApp()?.CloudStorage
      if (!cs) return done(false)

      if (byteSize(value) > MAX_VALUE_BYTES) {
        console.warn(
          `[storage] "${key}" не влезает в лимит CloudStorage (${MAX_VALUE_BYTES} Б) и не сохранён.`,
        )
        return done(false)
      }
      cs.setItem(key, value, (err, ok) => done(!err && ok !== false))
    }),

  removeItem: (key) =>
    withTimeout<boolean>(false, (done) => {
      const cs = getWebApp()?.CloudStorage
      if (!cs) return done(false)
      cs.removeItem(key, (err) => done(!err))
    }),
}
