/**
 * Адрес админки. Задаётся переменной VITE_ADMIN_PATH, чтобы его можно было
 * сделать неочевидным.
 *
 * Это не защита: путь всё равно виден в собранном коде. Доступ ограничивают
 * вход и политики базы — секретность адреса лишь избавляет от случайных гостей.
 */
const RAW = (import.meta.env.VITE_ADMIN_PATH as string | undefined)?.replace(/^\/+|\/+$/g, '')

export const ADMIN_SEGMENT = RAW && RAW.length > 0 ? RAW : 'studio'

export function adminPath(suffix = ''): string {
  return `/${ADMIN_SEGMENT}${suffix}`
}
