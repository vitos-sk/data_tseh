import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/modules/settings/settings.store'

/** Символы дождя: латиница, цифры и катакана — как в оригинале. */
const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFXYZ<>/\\|='
const FONT_SIZE = 14
const STEP_MS = 70

/**
 * Матричный дождь под содержимым Главной.
 *
 * Живёт только на одном экране и только под вуалью: canvas плюс стекло
 * на каждой карточке заметно просаживают средний Android, а стиль держится
 * и без дождя на остальных экранах.
 *
 * Отрисовка останавливается, когда вкладку свернули, — иначе мини-апп
 * продолжает жечь батарею в фоне.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let drops: number[] = []
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`
      ctx.textBaseline = 'top'

      const columns = Math.ceil(width / FONT_SIZE)
      // Старые колонки сохраняем: при повороте экрана дождь не начинается заново
      drops = Array.from({ length: columns }, (_, i) => drops[i] ?? Math.random() * -40)
    }

    const draw = () => {
      // Не clearRect: полупрозрачная заливка оставляет за каплями шлейф
      ctx.fillStyle = 'rgba(5, 5, 5, 0.09)'
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < drops.length; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const y = drops[i] * FONT_SIZE

        // Голова капли ярче хвоста — иначе дождь читается как ровная сетка
        ctx.fillStyle = Math.random() > 0.94 ? '#ff3b3b' : '#8f1d1d'
        ctx.fillText(glyph, i * FONT_SIZE, y)

        if (y > height && Math.random() > 0.975) drops[i] = 0
        else drops[i] += 1
      }
    }

    resize()

    // Меньше анимации — рисуем один кадр и останавливаемся: фон остаётся
    // фактурным, но ничего не движется.
    if (reducedMotion) {
      draw()
      return
    }

    let timer = 0
    const start = () => {
      if (timer) return
      timer = window.setInterval(draw, STEP_MS)
    }
    const stop = () => {
      window.clearInterval(timer)
      timer = 0
    }

    const onVisibility = () => (document.hidden ? stop() : start())

    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="size-full" />
      {/* Вуаль: без неё текст поверх капель не читается вообще */}
      <div className="absolute inset-0 bg-[var(--veil)]" />
    </div>
  )
}
