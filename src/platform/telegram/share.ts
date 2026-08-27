import { getWebApp, isInsideTelegram } from './webapp'

/**
 * Имя бота и короткое имя мини-аппы. Заданы — пост уезжает в чат ссылкой,
 * которая открывает его прямо внутри приложения. Не заданы — уходит обычный
 * веб-адрес: он тоже работает, просто без нативного запуска.
 */
const BOT = import.meta.env.VITE_TG_BOT as string | undefined
const APP = import.meta.env.VITE_TG_APP as string | undefined

/** Ссылка на пост в том виде, в котором её стоит отправлять другому человеку. */
export function postLink(slug: string): string {
  return BOT && APP
    ? `https://t.me/${BOT}/${APP}?startapp=${slug}`
    : `${window.location.origin}/p/${slug}`
}

/**
 * Отправить пост в чат.
 *
 * Внутри Telegram открываем нативный выбор чата — это тот самый жест,
 * ради которого каталог живёт мини-аппой, а не страницей. Снаружи
 * отдаём ссылку системному «Поделиться», а если и его нет — в буфер.
 */
export async function sharePost(slug: string, title: string): Promise<boolean> {
  const link = postLink(slug)
  const app = getWebApp()

  if (app && isInsideTelegram()) {
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title)}`
    app.openTelegramLink(url)
    return true
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, url: link })
      return true
    } catch {
      // Пользователь закрыл системное окно — это не ошибка, просто отказ.
      return false
    }
  }

  try {
    await navigator.clipboard.writeText(link)
    return true
  } catch {
    return false
  }
}
