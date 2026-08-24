import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

/** Группа строк-настроек: одна поверхность, разделители внутри. */
export function RowGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-5">
      {title && (
        <h2 className="mb-2.5 px-1 text-[13px] font-semibold tracking-wide text-muted uppercase">
          {title}
        </h2>
      )}
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface">
        <div className="divide-y divide-hairline">{children}</div>
      </div>
    </section>
  )
}

interface RowProps {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  accent?: string
}

export function LinkRow({ icon, label, value, onClick, accent }: RowProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('tap')
        onClick?.()
      }}
      className="press flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: accent ? `${accent}1F` : 'var(--color-inset)' }}
      >
        <span style={{ color: accent ?? 'var(--color-muted)' }}>{icon}</span>
      </span>
      <span className="flex-1 text-[16px] font-medium">{label}</span>
      {value && <span className="text-[15px] text-muted">{value}</span>}
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  )
}

interface ToggleRowProps {
  icon: React.ReactNode
  label: string
  hint?: string
  checked: boolean
  onChange: () => void
  accent?: string
}

export function ToggleRow({ icon, label, hint, checked, onChange, accent }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: accent ? `${accent}1F` : 'var(--color-inset)' }}
      >
        <span style={{ color: accent ?? 'var(--color-muted)' }}>{icon}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{hint}</span>}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => {
          haptic('select')
          onChange()
        }}
        className={cn(
          'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-gold' : 'bg-inset',
        )}
      >
        <span
          className={cn(
            // left-0 обязателен: у button браузерный text-align: center,
            // и без него абсолютный кружок встаёт по центру, а не слева.
            'absolute top-[2px] left-0 size-[27px] rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-[var(--ease-ios)]',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
          )}
        />
      </button>
    </div>
  )
}

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-[var(--radius-inset)] bg-inset px-3 py-3.5 text-center">
      <p className="text-[22px] leading-none font-extrabold tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12.5px] leading-tight text-muted">{label}</p>
    </div>
  )
}

interface ConfirmRowProps {
  icon: React.ReactNode
  label: string
  /** Текст, который заменит подпись при запросе подтверждения */
  confirmLabel: string
  onConfirm: () => void
  accent?: string
}

/**
 * Опасное действие с подтверждением прямо в строке. Нативный confirm()
 * использовать нельзя: модальное окно блокирует WebView Telegram
 * и мини-апп перестаёт отвечать.
 */
export function ConfirmRow({ icon, label, confirmLabel, onConfirm, accent }: ConfirmRowProps) {
  const [asking, setAsking] = useState(false)

  // Забытый вопрос сам снимается: случайное нажатие не должно висеть вечно.
  useEffect(() => {
    if (!asking) return
    const timer = setTimeout(() => setAsking(false), 5000)
    return () => clearTimeout(timer)
  }, [asking])

  const iconBox = (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
      style={{ backgroundColor: accent ? `${accent}1F` : 'var(--color-inset)' }}
    >
      <span style={{ color: accent ?? 'var(--color-muted)' }}>{icon}</span>
    </span>
  )

  // Пока вопроса нет, нажимается вся строка целиком: стрелка сама по себе —
  // цель в 18 пикселей, мимо которой легко промахнуться пальцем.
  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => {
          haptic('tap')
          setAsking(true)
        }}
        className="press flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
      >
        {iconBox}
        <span className="flex-1 text-[16px] font-medium">{label}</span>
        <ChevronRight size={18} className="shrink-0 text-muted" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      {iconBox}
      <span className="min-w-0 flex-1 text-[16px] font-medium">{confirmLabel}</span>

      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => {
            haptic('tap')
            setAsking(false)
          }}
          className="press rounded-full bg-inset px-3.5 py-1.5 text-[14px] font-medium text-muted"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => {
            haptic('warning')
            setAsking(false)
            onConfirm()
          }}
          className="press rounded-full bg-gold px-3.5 py-1.5 text-[14px] font-semibold text-bg"
        >
          Сбросить
        </button>
      </span>
    </div>
  )
}
