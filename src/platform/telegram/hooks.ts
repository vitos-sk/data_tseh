import { useEffect, useRef } from 'react'
import { getWebApp, isInsideTelegram } from './webapp'
import type { TelegramUser } from './types'

/**
 * Показывает нативную кнопку «назад» Telegram, пока экран смонтирован.
 * Вне Telegram — тихо ничего не делает, экран сам рисует свою стрелку.
 */
export function useBackButton(onBack: (() => void) | null) {
  const handler = useRef(onBack)
  const enabled = onBack !== null

  useEffect(() => {
    handler.current = onBack
  })

  useEffect(() => {
    const app = getWebApp()
    if (!app || !enabled) return

    const cb = () => handler.current?.()
    app.BackButton.onClick(cb)
    app.BackButton.show()

    return () => {
      app.BackButton.offClick(cb)
      app.BackButton.hide()
    }
    // Пересоздаём подписку только при появлении/исчезновении обработчика,
    // а не на каждый рендер: сам колбэк живёт в ref.
  }, [enabled])
}

type HapticKind = 'tap' | 'select' | 'success' | 'warning'

/** Тактильная отдача. Вне Telegram — пустышка, вызывать можно откуда угодно. */
export function haptic(kind: HapticKind = 'tap') {
  const hf = getWebApp()?.HapticFeedback
  if (!hf) return
  switch (kind) {
    case 'tap':
      hf.impactOccurred('light')
      break
    case 'select':
      hf.selectionChanged()
      break
    case 'success':
      hf.notificationOccurred('success')
      break
    case 'warning':
      hf.notificationOccurred('warning')
      break
  }
}

/**
 * Открывает внешнюю ссылку. Внутри Telegram window.open работает
 * непредсказуемо: ссылки на t.me должны уходить в сам мессенджер,
 * остальные — во встроенный браузер.
 */
export function openLink(href: string) {
  const app = getWebApp()
  if (!app || !isInsideTelegram()) {
    window.open(href, '_blank', 'noopener')
    return
  }

  if (href.startsWith('https://t.me/') || href.startsWith('tg://')) {
    app.openTelegramLink(href)
  } else {
    app.openLink(href)
  }
}

export function getTelegramUser(): TelegramUser | null {
  return getWebApp()?.initDataUnsafe.user ?? null
}
