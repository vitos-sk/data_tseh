import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  text: string
  action?: React.ReactNode
  /**
   * Пусто — это норма, сбой — нет. Тревожный вариант забирает жёлтый
   * статусный цвет: он и в callout'ах значит «что-то не так».
   */
  tone?: 'quiet' | 'alert'
}

/** Пустое состояние: квадрат со стеклом, строчный заголовок, тихое описание. */
export function EmptyState({ icon, title, text, action, tone = 'quiet' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div
        className={cn(
          'glass mb-5 flex size-14 items-center justify-center rounded-card',
          tone === 'alert' ? 'border-warn/40 text-warn' : 'text-accent',
        )}
      >
        {icon}
      </div>
      <h3 className="type-heading mb-2.5 font-bold tracking-[0.12em] lowercase">{title}</h3>
      <p className="type-body max-w-[300px] text-dim">{text}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}
