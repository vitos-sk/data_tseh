import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'

import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { progressOf, useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'
import { CoverArt } from './CoverArt'

/**
 * Секция «Продолжить» целиком, вместе с заголовком. Показывается только когда
 * есть что продолжать: иначе на Главной висел бы пустой заголовок.
 */
export function ContinueSection() {
  const navigate = useNavigate()
  const hydrated = useLibraryStore((s) => s.hydrated)
  const lastOpened = useLibraryStore((s) => s.lastOpened)
  const courseId = lastOpened?.courseId ?? null

  const { data: course } = useAsync(
    () => (courseId ? catalogRepository.getCourseById(courseId) : Promise.resolve(null)),
    [courseId],
  )

  const done = useLibraryStore((s) => (courseId ? (s.completed[courseId]?.length ?? 0) : 0))

  // Пока прогресс едет из хранилища, ничего не обещаем: показать заголовок
  // и тут же его убрать хуже, чем показать на пару сотен миллисекунд позже.
  if (!hydrated || !lastOpened) return null

  const progress = course ? progressOf(done, course.lessonsCount) : 0

  return (
    <section className="pt-4">
      <SectionHeader title="Продолжить" />

      {!course ? (
        <Skeleton className="mx-5 h-[86px] rounded-[var(--radius-card)]" />
      ) : (
        <button
          type="button"
          onClick={() => {
            haptic('tap')
            navigate(`/course/${course.slug}`)
          }}
          className="press mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3.5 rounded-[var(--radius-card)] bg-surface p-3 text-left"
        >
          <CoverArt cover={course.cover} className="size-14 shrink-0 rounded-xl" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold tracking-[-0.01em]">{course.title}</p>
            <div className="mt-2 flex items-center gap-2.5">
              <ProgressBar value={progress} className="h-1 flex-1" />
              <span className="shrink-0 text-[12.5px] font-medium text-muted tabular-nums">
                {done} из {course.lessonsCount}
              </span>
            </div>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-bg">
            <ArrowRight size={18} strokeWidth={2.6} />
          </span>
        </button>
      )}
    </section>
  )
}
