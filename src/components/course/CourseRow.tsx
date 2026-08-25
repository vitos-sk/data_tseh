import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDuration, pluralLessons } from '@/lib/format'
import type { Course } from '@/modules/catalog'
import { progressOf, useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

/**
 * Компактная строка курса: каталог и сохранённое.
 *
 * Здесь плоская поверхность вместо стекла: строк на экране много,
 * а backdrop-filter на каждой заметно просаживает средний Android.
 * Разницу видно только рядом с матрицей — на этих экранах её нет.
 */
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
      className="glass-live flex cursor-pointer items-center gap-3 rounded-card border border-hairline bg-surface p-2.5"
    >
      <CoverArt cover={course.cover} className="size-16 shrink-0 rounded-[2px]" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14.5px] font-bold tracking-[0.04em]">{course.title}</h3>
        <p className="mt-1 truncate text-[12px] tracking-[0.02em] text-dim">
          {pluralLessons(course.lessonsCount)} · {formatDuration(course.durationMin)}
        </p>
        {progress > 0 && <ProgressBar value={progress} className="mt-2.5" />}
      </div>

      <SaveButton courseId={course.id} variant="inset" />
    </article>
  )
}
