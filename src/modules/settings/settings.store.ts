import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from '@/platform/storage'

export type LanguageCode = 'ru'

interface SettingsState {
  language: LanguageCode
  /** Напоминания о незаконченных курсах. Пока только флаг — рассылки нет. */
  reminders: boolean
  /** Уменьшенная анимация переходов */
  reducedMotion: boolean

  setLanguage: (language: LanguageCode) => void
  toggleReminders: () => void
  toggleReducedMotion: () => void
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
      reducedMotion: false,

      setLanguage: (language) => set({ language }),
      toggleReminders: () => set((s) => ({ reminders: !s.reminders })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: 'settings', storage: createJSONStorage(() => storage) },
  ),
)
