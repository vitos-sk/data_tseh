import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface ChipProps {
  label: string
  active?: boolean
  onClick: () => void
}

/** Pill-фильтр. Активный — золотой, это главный сигнатурный элемент интерфейса. */
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
        'press shrink-0 rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap',
        'transition-colors duration-200',
        active ? 'bg-gold text-bg' : 'bg-surface text-muted',
      )}
    >
      {label}
    </button>
  )
}
