import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface ChipProps {
  label: string
  active?: boolean
  onClick: () => void
}

/** Фильтр направления. Активный залит светом навылет — главный сигнал выбора. */
export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('select')
        onClick()
      }}
      aria-pressed={active}
      className={cn(
        'label flex min-h-11 shrink-0 items-center rounded-btn border px-3.5 whitespace-nowrap',
        'transition-colors duration-200',
        active
          ? 'border-accent bg-accent text-bg shadow-[var(--glow-hover)]'
          : 'border-hairline bg-surface text-dim active:border-accent/26 active:text-fg',
      )}
    >
      {label}
    </button>
  )
}
