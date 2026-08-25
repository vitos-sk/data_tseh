import { Check, Copy, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/useCopy'

interface CopyButtonProps {
  /** Что именно уедет в буфер обмена. */
  text: string
  /** Подпись рядом с иконкой. Без неё кнопка квадратная, только с иконкой. */
  label?: string
  /** Во всю ширину — для промта, где копирование и есть главное действие. */
  full?: boolean
  className?: string
}

/**
 * Кнопка копирования. Высота не меньше 36px: это телефон и палец,
 * а не курсор мыши.
 *
 * После нажатия подпись меняется на «скопировано» — состояние важнее
 * экономии места: без подтверждения непонятно, сработало ли.
 */
export function CopyButton({ text, label, full = false, className }: CopyButtonProps) {
  const { copied, failed, copy } = useCopy()

  const Icon = failed ? X : copied ? Check : Copy
  const caption = failed ? 'не вышло' : copied ? 'скопировано' : label

  return (
    <button
      type="button"
      aria-label={label ? undefined : 'Скопировать'}
      onClick={(e) => {
        e.stopPropagation()
        void copy(text)
      }}
      className={cn(
        'press flex h-9 shrink-0 items-center justify-center gap-2 rounded-btn border text-[11px] font-bold tracking-[0.16em] uppercase transition-colors duration-200',
        label ? 'px-3.5' : 'w-9',
        full && 'h-11 w-full',
        copied
          ? 'border-red bg-red/15 text-red-bright'
          : failed
            ? 'border-warn/50 text-warn'
            : 'border-hairline bg-inset text-dim',
        className,
      )}
    >
      <Icon size={14} strokeWidth={2.4} />
      {caption && <span>{caption}</span>}
    </button>
  )
}
