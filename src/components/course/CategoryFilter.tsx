import { Chip } from '@/components/ui/Chip'
import { CATEGORIES } from '@/data/categories'
import type { CategoryId } from '@/modules/catalog'

export type CategoryFilterValue = CategoryId | 'all'

interface CategoryFilterProps {
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
}

/** Горизонтальная лента фильтров. Липнет к верху, чтобы не терялась при скролле. */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="sticky top-0 z-30 bg-bg/90 py-2 backdrop-blur-xl">
      {/* Маска справа подсказывает, что лента продолжается за краем */}
      <div
        className="scroll-x-clean flex gap-2 px-5"
        style={{
          maskImage: 'linear-gradient(to right, #000 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, #000 88%, transparent 100%)',
        }}
      >
        <Chip label="Всё" active={value === 'all'} onClick={() => onChange('all')} />
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            label={category.chip}
            active={value === category.id}
            onClick={() => onChange(category.id)}
          />
        ))}
      </div>
    </div>
  )
}
