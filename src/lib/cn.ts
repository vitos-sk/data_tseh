type ClassValue = string | false | null | undefined

/** Склейка классов. Одна строчка вместо зависимости от clsx. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
