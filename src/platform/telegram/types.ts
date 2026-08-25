/**
 * Минимальное описание Telegram WebApp — только то, чем мы реально пользуемся.
 * Полный SDK не типизируем намеренно: лишние поля быстро расходятся с реальностью.
 */

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: { user?: TelegramUser }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  viewportHeight: number
  viewportStableHeight: number
  isExpanded: boolean

  ready(): void
  expand(): void
  close(): void
  onEvent(event: string, handler: () => void): void
  offEvent(event: string, handler: () => void): void

  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void

  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  /** Появился в Bot API 7.10 — в старых клиентах метода нет */
  setBottomBarColor?(color: string): void
  disableVerticalSwipes?(): void
  enableClosingConfirmation?(): void

  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
  }

  MainButton: {
    text: string
    isVisible: boolean
    isActive: boolean
    show(): void
    hide(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
  }

  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }

  CloudStorage: {
    setItem(key: string, value: string, cb?: (err: string | null, ok?: boolean) => void): void
    getItem(key: string, cb: (err: string | null, value?: string) => void): void
    removeItem(key: string, cb?: (err: string | null, ok?: boolean) => void): void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}
