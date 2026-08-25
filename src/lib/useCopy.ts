import { useCallback, useEffect, useRef, useState } from 'react'
import { haptic } from '@/platform/telegram'

/** Сколько держится подтверждение «скопировано». */
const CONFIRM_MS = 1600

/**
 * Кладёт текст в буфер обмена и на полторы секунды поднимает флаг copied.
 *
 * Запасной путь через скрытое textarea нужен всерьёз: Clipboard API требует
 * защищённого контекста и разрешения, а внутри WebView Telegram выполняется
 * не всегда. Молча не скопировать — худшее, что может сделать кнопка,
 * существующая ради копирования.
 */
export function useCopy(): {
  copied: boolean
  failed: boolean
  copy: (text: string) => Promise<void>
} {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const copy = useCallback(async (text: string) => {
    const ok = (await writeToClipboard(text)) || legacyCopy(text)

    setCopied(ok)
    setFailed(!ok)
    haptic(ok ? 'success' : 'warning')

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, CONFIRM_MS)
  }, [])

  return { copied, failed, copy }
}

async function writeToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** document.execCommand объявлен устаревшим, но в старых WebView работает только он. */
function legacyCopy(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  // Держим поле в потоке документа, но вне видимости: display:none и
  // visibility:hidden не дают выделению сработать.
  area.setAttribute('readonly', '')
  area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
  document.body.append(area)

  try {
    area.select()
    area.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}
