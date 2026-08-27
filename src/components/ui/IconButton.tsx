import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface IconButtonProps {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
  className?: string
}

/**
 * Квадратная кнопка-иконка. Видимый квадрат 40px, зона касания — 44px
 * за счёт псевдоэлемента: 40 это компромисс с плотностью интерфейса,
 * а 44 — минимум, ниже которого палец начинает промахиваться.
 */
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
        'press relative flex size-10 shrink-0 items-center justify-center rounded-btn border',
        'after:absolute after:-inset-0.5 after:content-[\'\']',
        'transition-colors duration-200',
        active
          ? 'border-accent bg-accent text-bg'
          : 'border-hairline bg-inset text-dim active:border-accent/26 active:text-accent-bright',
        className,
      )}
    >
      {children}
    </button>
  )
}
