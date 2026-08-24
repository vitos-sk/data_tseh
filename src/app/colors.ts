/**
 * Те же цвета, что и в theme.css, но доступные из JS.
 * Нужны там, где цвет уходит в нативный интерфейс Telegram или в canvas —
 * туда CSS-переменную не передать.
 */
export const COLORS = {
  bg: '#1A1A1C',
  surface: '#262629',
  inset: '#2E2E32',
  fg: '#FFFFFF',
  muted: '#8E8E93',
  cta: '#F4F3EE',
  gold: '#C9A84C',
  green: '#34C759',
  orange: '#FF9F0A',
  blue: '#3B9EFF',
  purple: '#C77DFF',
} as const

export type AccentName = 'green' | 'orange' | 'blue' | 'purple'
