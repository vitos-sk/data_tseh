import { Search, X } from 'lucide-react'
import { haptic } from '@/platform/telegram'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

/** Поле поиска на вложенной поверхности. Очистка — крестиком, без submit. */
export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-inset px-4 py-2.5">
      <Search size={18} className="shrink-0 text-muted" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // enterKeyHint и type=text вместо search: своя кнопка очистки
        // выглядит одинаково во всех браузерах, нативная — нет.
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-[16px] text-fg outline-none placeholder:text-muted"
      />

      {value && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => {
            haptic('tap')
            onChange('')
          }}
          className="press flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-muted"
        >
          <X size={13} strokeWidth={2.6} />
        </button>
      )}
    </div>
  )
}
