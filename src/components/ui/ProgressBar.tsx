import { cn } from '@/lib/cn'

interface ProgressBarProps {
  /** 0…1 */
  value: number
  className?: string
}

/** Полоса прогресса. Прямая, без скруглений: та же геометрия, что у карточек. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100)

  return (
    <div
      className={cn('h-[3px] w-full overflow-hidden bg-red/12', className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-red shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-[width] duration-500 ease-[var(--ease-ios)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
