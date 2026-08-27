import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from '@/platform/storage'

export type LanguageCode = 'ru'

interface SettingsState {
  language: LanguageCode
  /*
   * Напоминания вернуться к сохранённому. Рассылки пока нет, поэтому
   * переключателя в профиле тоже нет: обещать то, чего система не делает,
   * дороже, чем не показывать настройку. Поле оставлено — оно появится
   * вместе с рассылкой и не сломает формат хранения.
   */
  reminders: boolean
  /** Уменьшенная анимация переходов */
  reducedMotion: boolean

  setLanguage: (language: LanguageCode) => void
  toggleReminders: () => void
  toggleReducedMotion: () => void
}

/**
 * Системная настройка «уменьшить движение» — значение по умолчанию, а не
 * то, что можно проигнорировать. Раньше стор всегда стартовал с false,
 * ставил на <html> data-motion="full" и тем самым отменял системный запрос
 * пользователя ещё до того, как он что-то выбрал.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Настройки приложения. Язык сейчас один (docs/decisions — мультиязычность
 * отложена), поле оставлено, чтобы добавление второго не ломало формат хранения.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ru',
      reminders: true,
      reducedMotion: prefersReducedMotion(),

      setLanguage: (language) => set({ language }),
      toggleReminders: () => set((s) => ({ reminders: !s.reminders })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: 'settings', storage: createJSONStorage(() => storage) },
  ),
)
