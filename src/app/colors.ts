/**
 * Те же цвета, что и в theme.css, но доступные из JS.
 * Нужны там, где цвет уходит в нативный интерфейс Telegram или в canvas —
 * туда CSS-переменную не передать.
 */
export const COLORS = {
  bg: '#050505',
  surface: '#0C0C0E',
  inset: '#131316',
  fg: '#E5E5E5',
  muted: '#A3A3A3',
  /** Мелкие метки. Осветлён относительно оригинального #737373 ради AA. */
  dim: '#8A8A8A',

  /** Рамки, заливки и свечения */
  red: '#DC2626',
  /** Всё, что набрано текстом: 5.77:1 против 4.22:1 у основного красного */
  redBright: '#FF3B3B',
  redDeep: '#B91C1C',

  /** Статусные индикаторы — единственные цвета вне красно-нейтральной оси */
  ok: '#22C55E',
  warn: '#EAB308',
} as const

/**
 * Имена акцентов достались от прежней темы и живут в базе, поэтому остаются
 * как есть. Значения — только красная ось: категории различаются
 * интенсивностью, а не цветом.
 */
export type AccentName = 'green' | 'orange' | 'blue' | 'purple'

export const ACCENT: Record<AccentName, string> = {
  blue: COLORS.red,
  purple: COLORS.redBright,
  green: COLORS.redDeep,
  orange: '#E04141',
}
