import { cn } from '@/lib/cn'

interface ProgressBarProps {
  /** 0…1 */
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100)

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/8', className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gold transition-[width] duration-500 ease-[var(--ease-ios)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
