import { cn } from '@/lib/cn'

type BadgeTone = 'accent' | 'neutral' | 'glass'

interface BadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}

const TONES: Record<BadgeTone, string> = {
  // Инверсия: светлая заливка, чёрная краска. Под мелким кеглем акцент
  // работает как плашка, а не как цвет буквы.
  accent: 'bg-accent text-bg',
  neutral: 'bg-inset text-dim',
  // Поверх обложки: тёмное стекло со светящейся рамкой
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
