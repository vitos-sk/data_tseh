import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'

interface SaveButtonProps {
  courseId: string
  /** На обложке нужна стеклянная подложка, в списке — вложенная поверхность. */
  variant?: 'glass' | 'inset'
}

export function SaveButton({ courseId, variant = 'glass' }: SaveButtonProps) {
  const saved = useLibraryStore((s) => s.saved.includes(courseId))
  const toggle = useLibraryStore((s) => s.toggleSaved)

  return (
    <button
      type="button"
      aria-label={saved ? 'Убрать из сохранённого' : 'Сохранить курс'}
      aria-pressed={saved}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        haptic(saved ? 'tap' : 'success')
        toggle(courseId)
      }}
      className={cn(
        'press flex size-9 items-center justify-center rounded-btn border transition-colors duration-200',
        variant === 'glass' ? 'bg-black/50 backdrop-blur-sm' : 'bg-inset',
        saved ? 'border-red text-red-bright shadow-[var(--glow-red)]' : 'border-hairline text-dim',
      )}
    >
      <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
