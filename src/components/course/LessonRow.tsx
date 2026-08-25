import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDuration } from '@/lib/format'
import type { Lesson } from '@/modules/catalog'

interface LessonRowProps {
  lesson: Lesson
  done: boolean
  /** Урок, с которого продолжится чтение — разблокированная строка терминала. */
  current: boolean
  onClick: () => void
}

export function LessonRow({ lesson, done, current, onClick }: LessonRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press flex w-full items-center gap-3 rounded-btn border p-2.5 text-left',
        'transition-colors duration-200',
        current
          ? 'border-red/35 bg-red/8 shadow-[var(--glow-red)]'
          : 'border-transparent bg-transparent',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-btn border text-[13px] font-bold tabular-nums',
          done
            ? 'border-red bg-red text-white'
            : 'border-hairline bg-inset text-dim',
        )}
      >
        {done ? <Check size={15} strokeWidth={3} /> : lesson.order}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[14px] font-medium tracking-[0.03em]',
            done ? 'text-dim' : 'text-fg',
          )}
        >
          {lesson.title}
        </span>
        <span className="mt-1 block text-[11.5px] tracking-[0.02em] text-dim">
          {formatDuration(lesson.durationMin)} чтения
        </span>
      </span>

      {current && <span className="label shrink-0 text-red-bright">сейчас</span>}
    </button>
  )
}

/** Заглушка на будущее: платные курсы пока не заведены. */
export function LockedLessonRow({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-btn p-2.5 opacity-45">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-btn border border-hairline bg-inset text-dim">
        <Lock size={15} />
      </span>
      <span className="truncate text-[14px] font-medium tracking-[0.03em] text-dim">{title}</span>
    </div>
  )
}
