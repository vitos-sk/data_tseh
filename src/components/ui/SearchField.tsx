import { Search, X } from 'lucide-react'
import { haptic } from '@/platform/telegram'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

/** Поле поиска — строка приглашения терминала. Очистка крестиком, без submit. */
export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <div className="glass glass-live flex items-center gap-2.5 rounded-btn px-3.5 py-3">
      <Search size={16} className="shrink-0 text-accent" />

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
        className="min-w-0 flex-1 bg-transparent type-ui tracking-[0.02em] text-fg caret-[var(--color-accent-bright)] outline-none placeholder:text-dim"
      />

      {value && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => {
            haptic('tap')
            onChange('')
          }}
          className="press relative flex size-5 shrink-0 items-center justify-center rounded-[2px] bg-accent/14 text-accent-bright after:absolute after:-inset-3 after:content-['']"
        >
          <X size={12} strokeWidth={2.6} />
        </button>
      )}
    </div>
  )
}
