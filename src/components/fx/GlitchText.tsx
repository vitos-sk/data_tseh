import { cn } from '@/lib/cn'

interface GlitchTextProps {
  children: string
  className?: string
}

/**
 * Заголовок с глитчем: два слоя-двойника поверх исходного текста дёргаются
 * только в последние 10% цикла. Приём редкий — потому и не раздражает.
 *
 * Двойники берут текст из data-атрибута и скрыты от скринридера: озвучивать
 * заголовок трижды не нужно.
 */
export function GlitchText({ children, className }: GlitchTextProps) {
  return (
    <span className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>

      <span
        aria-hidden
        className="absolute inset-0 text-red-bright"
        style={{ animation: 'glitch-a 6s infinite steps(1, end)' }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 text-ok"
        style={{ animation: 'glitch-b 6s infinite steps(1, end)' }}
      >
        {children}
      </span>
    </span>
  )
}
