import { COLORS } from '@/app/colors'
import type { TelegramWebApp } from './types'

/**
 * Возвращает WebApp, если приложение открыто внутри Telegram.
 * Вне Telegram — null, и всё приложение обязано продолжать работать.
 */
export function getWebApp(): TelegramWebApp | null {
  const app = window.Telegram?.WebApp
  // Вне Telegram объект иногда существует, но без initData и версии — это не наш случай.
  return app && typeof app.ready === 'function' ? app : null
}

/**
 * Приложение реально открыто внутри Telegram, а не просто загрузило его скрипт.
 * В обычном браузере telegram-web-app.js всё равно создаёт window.Telegram.WebApp,
 * но отдаёт platform "unknown" и пустой initData — по ним и отличаем.
 */
export function isInsideTelegram(): boolean {
  const app = getWebApp()
  if (!app) return false
  return app.platform !== 'unknown' && app.platform !== ''
}

/**
 * Адрес поста, с которого Telegram просит начать.
 *
 * Ссылка вида t.me/<bot>/<app>?startapp=<slug> приходит в start_param —
 * без этого переход по присланному в чат посту открывал бы Главную,
 * и человек искал бы обещанный пост руками.
 *
 * Значение приходит снаружи, поэтому сверяем его с формой slug'а, а не
 * подставляем в маршрут как есть.
 */
export function getStartPostSlug(): string | null {
  const param = getWebApp()?.initDataUnsafe.start_param
  return param && /^[a-z0-9-]{1,64}$/.test(param) ? param : null
}

/** Синхронизирует высоту вьюпорта Telegram с CSS-переменной, чтобы таб-бар не прыгал. */
function syncViewport(app: TelegramWebApp): () => void {
  const apply = () => {
    document.documentElement.style.setProperty(
      '--tg-stable-height',
      `${app.viewportStableHeight}px`,
    )
  }
  apply()
  app.onEvent('viewportChanged', apply)
  return () => app.offEvent('viewportChanged', apply)
}

/**
 * Вызывается один раз на старте. Забирает у Telegram только служебное поведение:
 * цвета мы задаём сами (см. docs/decisions/0005).
 */
export function initTelegram(): () => void {
  const app = getWebApp()
  if (!app || !isInsideTelegram()) return () => {}

  app.ready()
  app.expand()
  app.setHeaderColor(COLORS.bg)
  app.setBackgroundColor(COLORS.bg)
  // Нижняя панель тоже наша: иначе под таб-баром остаётся полоса цвета
  // темы клиента, и она светлее фона приложения. Метод появился в 7.10.
  app.setBottomBarColor?.(COLORS.bg)
  // Свайп вниз внутри скролла не должен закрывать мини-апп. Метод появился в 7.7.
  app.disableVerticalSwipes?.()

  return syncViewport(app)
}
