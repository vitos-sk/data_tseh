import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COLORS } from '@/app/colors'
import { cn } from '@/lib/cn'
import { haptic } from '@/platform/telegram'

/** Группа строк-настроек: одна поверхность, разделители внутри. */
export function RowGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-5">
      {title && <h2 className="label mb-2.5 px-1 text-accent">{title}</h2>}
      <div className="glass overflow-hidden rounded-card">
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

/** Квадрат под значок строки. Тон задаётся акцентом, форма — общая. */
function IconBox({ icon, accent }: { icon: React.ReactNode; accent?: string }) {
  const color = accent ?? COLORS.accent
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-btn border"
      style={{ backgroundColor: `${color}14`, borderColor: `${color}33`, color }}
    >
      {icon}
    </span>
  )
}

export function LinkRow({ icon, label, value, onClick, accent }: RowProps) {
  return (
    <button
      type="button"
      onClick={() => {
        haptic('tap')
        onClick?.()
      }}
      className="press flex w-full items-center gap-3.5 px-3.5 py-3.5 text-left"
    >
      <IconBox icon={icon} accent={accent} />
      <span className="flex-1 type-ui font-medium tracking-[0.03em]">{label}</span>
      {value && <span className="type-caption tracking-[0.02em] text-dim">{value}</span>}
      <ChevronRight size={16} className="shrink-0 text-dim" />
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
    <div className="flex items-center gap-3.5 px-3.5 py-3.5">
      <IconBox icon={icon} accent={accent} />

      <span className="min-w-0 flex-1">
        <span className="block type-ui font-medium tracking-[0.03em]">{label}</span>
        {hint && (
          <span className="mt-1 block type-micro tracking-[0.02em] text-dim">
            {hint}
          </span>
        )}
      </span>

      {/*
        Переключатель квадратный, как всё остальное: круглый тумблер тянул бы
        за собой iOS-эстетику, которой в интерфейсе больше нет.
      */}
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
          'relative h-[28px] w-[48px] shrink-0 rounded-btn border transition-colors duration-200',
          // Видимая высота 28px, цель касания — 44px
          "after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']",
          checked
            ? 'border-accent bg-accent/18 shadow-[var(--glow-accent)]'
            : 'border-hairline bg-inset',
        )}
      >
        <span
          className={cn(
            // left-0 обязателен: у button браузерный text-align: center,
            // и без него абсолютный бегунок встаёт по центру, а не слева.
            'absolute top-[3px] left-0 size-[20px] rounded-[2px]',
            'transition-transform duration-200 ease-[var(--ease-ios)]',
            checked ? 'translate-x-[25px] bg-accent' : 'translate-x-[3px] bg-dim',
          )}
        />
      </button>
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

  // Пока вопроса нет, нажимается вся строка целиком: стрелка сама по себе —
  // цель в 16 пикселей, мимо которой легко промахнуться пальцем.
  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => {
          haptic('tap')
          setAsking(true)
        }}
        className="press flex w-full items-center gap-3.5 px-3.5 py-3.5 text-left"
      >
        <IconBox icon={icon} accent={accent} />
        <span className="flex-1 type-ui font-medium tracking-[0.03em]">{label}</span>
        <ChevronRight size={16} className="shrink-0 text-dim" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 px-3.5 py-3.5">
      <IconBox icon={icon} accent={accent} />
      <span className="min-w-0 flex-1 type-body font-medium tracking-[0.03em]">
        {confirmLabel}
      </span>

      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => {
            haptic('tap')
            setAsking(false)
          }}
          className="press label rounded-btn border border-hairline px-3 py-2 text-dim"
        >
          отмена
        </button>
        <button
          type="button"
          onClick={() => {
            haptic('warning')
            setAsking(false)
            onConfirm()
          }}
          className="press label rounded-btn bg-accent px-3 py-2 text-bg"
        >
          сбросить
        </button>
      </span>
    </div>
  )
}
