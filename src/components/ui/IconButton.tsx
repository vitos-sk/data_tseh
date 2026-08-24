import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

interface IconButtonProps {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
  className?: string
}

/** Круглая кнопка-иконка на вложенной поверхности. */
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
        'press flex size-10 shrink-0 items-center justify-center rounded-full',
        'transition-colors duration-200',
        active ? 'bg-gold text-bg' : 'bg-inset text-muted',
        className,
      )}
    >
      {children}
    </button>
  )
}
