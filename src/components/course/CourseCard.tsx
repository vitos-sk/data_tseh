import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatDuration, pluralLessons } from '@/lib/format'
import type { Course } from '@/modules/catalog'
import { progressOf, useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'
import { CategoryIcon } from './CategoryIcon'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

const BADGE_LABEL = { new: 'Новое', free: 'Бесплатно' } as const

/** Крупная карточка для ленты рекомендаций на Главной. */
export function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate()
  const category = CATEGORY_BY_ID[course.categoryId]
  const done = useLibraryStore((s) => s.completed[course.id]?.length ?? 0)
  const progress = progressOf(done, course.lessonsCount)

  return (
    <article
      onClick={() => {
        haptic('tap')
        navigate(`/course/${course.slug}`)
      }}
      className="glass glass-live cursor-pointer rounded-card p-2.5"
    >
      <CoverArt cover={course.cover} className="h-44 rounded-[2px]">
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {course.badges.map((badge) => (
              <Badge key={badge} tone={badge === 'new' ? 'red' : 'glass'}>
                {BADGE_LABEL[badge]}
              </Badge>
            ))}
          </div>
          <SaveButton courseId={course.id} />
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-1.5">
          <Badge tone="glass">{formatDuration(course.durationMin)}</Badge>
          <Badge tone="glass">{pluralLessons(course.lessonsCount)}</Badge>
        </div>
      </CoverArt>

      <div className="flex items-start gap-3 px-1 pt-3.5 pb-1">
        <CategoryIcon category={category} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15.5px] leading-snug font-bold tracking-[0.04em]">{course.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.6] text-dim">
            {course.subtitle}
          </p>
        </div>
      </div>

      {progress > 0 && (
        <div className="mt-3 flex items-center gap-3 px-1 pb-1">
          <ProgressBar value={progress} className="flex-1" />
          <span className="label text-red-bright tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </article>
  )
}
