import { Briefcase, Code2, Hammer, Sparkles, Zap } from 'lucide-react'
import { ACCENT } from '@/app/colors'
import { cn } from '@/lib/cn'
import type { Category, IconName } from '@/modules/catalog'

const ICONS: Record<IconName, typeof Code2> = {
  Code2,
  Sparkles,
  Briefcase,
  Hammer,
  Zap,
}

interface CategoryIconProps {
  category: Category
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Значок направления. Квадрат со светящейся рамкой: направления различаются
 * светлотой, а не цветом — вся палитра лежит на одной нейтральной оси.
 */
export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const Icon = ICONS[category.icon]
  const color = ACCENT[category.accent]

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-btn border',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
      style={{ backgroundColor: `${color}14`, borderColor: `${color}3D` }}
    >
      <Icon size={size === 'md' ? 19 : 16} color={color} strokeWidth={2} />
    </div>
  )
}
