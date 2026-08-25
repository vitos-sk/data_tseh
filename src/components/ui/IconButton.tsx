import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface IconButtonProps {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
  className?: string
}

/** Квадратная кнопка-иконка. Размер 40px — минимальная цель касания. */
export function IconButton({ children, onClick, label, active, className }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        haptic('tap')
        onClick()
      }}
      className={cn(
        'press flex size-10 shrink-0 items-center justify-center rounded-btn border',
        'transition-colors duration-200',
        active
          ? 'border-red bg-red text-white'
          : 'border-hairline bg-inset text-dim active:border-red/35 active:text-red-bright',
        className,
      )}
    >
      {children}
    </button>
  )
}
