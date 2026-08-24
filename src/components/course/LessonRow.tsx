import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/lib/format'
import type { Lesson } from '@/modules/catalog'

interface LessonRowProps {
  lesson: Lesson
  done: boolean
  /** Урок, с которого продолжится чтение — выделяем золотой рамкой. */
  current: boolean
  onClick: () => void
}

export function LessonRow({ lesson, done, current, onClick }: LessonRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press flex w-full items-center gap-3.5 rounded-[var(--radius-inset)] p-3 text-left',
        'transition-colors duration-200',
        current ? 'bg-inset ring-1 ring-gold/45' : 'bg-transparent',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold tabular-nums',
          done ? 'bg-gold text-bg' : 'bg-inset text-muted',
        )}
      >
        {done ? <Check size={17} strokeWidth={3} /> : lesson.order}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[16px] font-medium',
            done ? 'text-muted' : 'text-fg',
          )}
        >
          {lesson.title}
        </span>
        <span className="mt-0.5 block text-[13px] text-muted">
          {formatDuration(lesson.durationMin)} чтения
        </span>
      </span>

      {current && <span className="shrink-0 text-[13px] font-semibold text-gold">Сейчас</span>}
    </button>
  )
}

/** Заглушка на будущее: платные курсы пока не заведены. */
export function LockedLessonRow({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[var(--radius-inset)] p-3 opacity-50">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-inset text-muted">
        <Lock size={16} />
      </span>
      <span className="truncate text-[16px] font-medium text-muted">{title}</span>
    </div>
  )
}
