import { cn } from '@/lib/cn'

type BadgeTone = 'gold' | 'neutral' | 'glass'

interface BadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}

const TONES: Record<BadgeTone, string> = {
  gold: 'bg-gold text-bg',
  neutral: 'bg-inset text-muted',
  // Поверх обложки: полупрозрачный тёмный, чтобы читалось на любом градиенте
  glass: 'bg-black/45 text-white backdrop-blur-sm',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1',
        'text-[11px] font-semibold tracking-wide uppercase',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
