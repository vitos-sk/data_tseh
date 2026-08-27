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
  accent: '#F5F5F5',
  /** Всё, что набрано текстом: чистый белый, 18.9:1 на фоне */
  accentBright: '#FFFFFF',
  /** Притушенный уровень: 4.9:1 на фоне — нижняя граница для основного кегля */
  accentDeep: '#7A7A7A',

  /** Статусные индикаторы — единственные цвета во всём интерфейсе */
  ok: '#22C55E',
  warn: '#EAB308',
} as const

/**
 * Имена акцентов достались от прежней темы и живут в базе, поэтому остаются
 * как есть. Значения — только светлота: категории различаются не тоном,
 * а тем, сколько света на них попадает.
 */
export type AccentName = 'green' | 'orange' | 'blue' | 'purple'

export const ACCENT: Record<AccentName, string> = {
  blue: COLORS.accent,
  purple: COLORS.accentBright,
  green: COLORS.accentDeep,
  orange: '#B8B8B8',
}
