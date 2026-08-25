import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface ChipProps {
  label: string
  active?: boolean
  onClick: () => void
}

/** Фильтр направления. Активный залит красным — это главный сигнал выбора. */
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
        'label shrink-0 rounded-btn border px-3.5 py-2.5 whitespace-nowrap',
        'transition-colors duration-200',
        active
          ? 'border-red bg-red text-white shadow-[var(--glow-hover)]'
          : 'border-hairline bg-surface text-dim active:border-red/35 active:text-fg',
      )}
    >
      {label}
    </button>
  )
}
