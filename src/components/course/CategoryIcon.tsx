import { Briefcase, Code2, Hammer, Sparkles, Zap } from 'lucide-react'
import { COLORS } from '@/app/colors'
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

/** Круглая иконка направления: цветной значок на тонированной подложке того же цвета. */
export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const Icon = ICONS[category.icon]
  const color = COLORS[category.accent]

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
      style={{ backgroundColor: `${color}1F` }}
    >
      <Icon size={size === 'md' ? 20 : 17} color={color} strokeWidth={2.2} />
    </div>
  )
}
