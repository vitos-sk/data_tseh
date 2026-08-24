import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDuration, pluralLessons } from '@/lib/format'
import type { Course } from '@/modules/catalog'
import { progressOf, useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

/** Компактная строка курса: каталог и сохранённое. */
export function CourseRow({ course }: { course: Course }) {
  const navigate = useNavigate()
  const done = useLibraryStore((s) => s.completed[course.id]?.length ?? 0)
  const progress = progressOf(done, course.lessonsCount)

  return (
    <article
      onClick={() => {
        haptic('tap')
        navigate(`/course/${course.slug}`)
      }}
      className="press flex cursor-pointer items-center gap-3.5 rounded-[var(--radius-card)] bg-surface p-3"
    >
      <CoverArt cover={course.cover} className="size-16 shrink-0 rounded-2xl" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em]">{course.title}</h3>
        <p className="mt-0.5 truncate text-[13.5px] text-muted">
          {pluralLessons(course.lessonsCount)} · {formatDuration(course.durationMin)}
        </p>
        {progress > 0 && <ProgressBar value={progress} className="mt-2 h-1" />}
      </div>

      <SaveButton courseId={course.id} variant="inset" />
    </article>
  )
}
