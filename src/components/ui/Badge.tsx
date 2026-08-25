import { cn } from '@/lib/cn'

type BadgeTone = 'red' | 'neutral' | 'glass'

interface BadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}

const TONES: Record<BadgeTone, string> = {
  // Заливка основным красным, текст белый: #dc2626 под мелким кеглем
  // читается только как фон, но не как краска.
  red: 'bg-red text-white',
  neutral: 'bg-inset text-dim',
  // Поверх обложки: тёмное стекло с красной рамкой
  glass: 'bg-black/55 text-fg backdrop-blur-sm border border-hairline',
}

/** Метка. Всегда капс с широким трекингом — контрапункт строчным заголовкам. */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn('label inline-flex items-center rounded-btn px-2 py-1', TONES[tone], className)}
    >
      {children}
    </span>
  )
}
