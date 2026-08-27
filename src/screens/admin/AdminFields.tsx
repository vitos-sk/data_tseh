import { cn } from '@/lib/cn'

const FIELD =
  'w-full rounded-btn bg-inset px-4 py-3 type-input text-fg outline-none placeholder:text-dim'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 type-body font-semibold tracking-wide text-dim uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block px-1 type-body text-dim">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(FIELD, className)}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  min = 1,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
}) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
      className={cn(FIELD, 'tabular-nums')}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(FIELD, 'resize-y leading-relaxed')}
    />
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(FIELD, 'appearance-none')}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-surface">
          {option.label}
        </option>
      ))}
    </select>
  )
}

/** Кнопка-переключатель в ряду: выбор одного из нескольких коротких значений. */
export function ChoiceRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'press rounded-btn px-4 py-2 type-ui font-medium transition-colors duration-200',
            value === option.value ? 'bg-accent text-bg' : 'bg-inset text-dim',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
