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

        // Голова капли ярче хвоста — иначе дождь читается как ровная сетка.
        // Белых голов заметно меньше, чем было красных: белая искра видна
        // сквозь вуаль вдвое сильнее, и при прежней частоте фон мельтешит.
        ctx.fillStyle = Math.random() > 0.965 ? '#f0f0f0' : '#2e2e2e'
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

    /*
     * requestAnimationFrame, а не setInterval: интервал продолжает ставить
     * задачи в очередь, даже когда браузер не успевает их выполнять, и на
     * слабом Android кадры копятся лавиной. rAF просто пропускает такт.
     *
     * Шаг дождя при этом остаётся прежним — 70 мс: за скоростью следит
     * накопитель времени, а не частота кадров экрана.
     */
    let raf = 0
    let last = 0

    const tick = (now: number) => {
      raf = window.requestAnimationFrame(tick)
      if (now - last < STEP_MS) return
      last = now
      draw()
    }

    const start = () => {
      if (raf) return
      last = 0
      raf = window.requestAnimationFrame(tick)
    }
    const stop = () => {
      window.cancelAnimationFrame(raf)
      raf = 0
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
