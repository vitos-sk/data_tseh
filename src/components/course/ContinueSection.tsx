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
    <section className="pt-5">
      <SectionHeader title="продолжить" />

      {!course ? (
        <Skeleton className="mx-5 h-[82px]" />
      ) : (
        <button
          type="button"
          onClick={() => {
            haptic('tap')
            navigate(`/course/${course.slug}`)
          }}
          className="glass glass-live mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-card p-2.5 text-left"
        >
          <CoverArt cover={course.cover} className="size-14 shrink-0 rounded-[2px]" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold tracking-[0.04em]">{course.title}</p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <ProgressBar value={progress} className="flex-1" />
              <span className="label shrink-0 text-dim tabular-nums">
                {done}/{course.lessonsCount}
              </span>
            </div>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-btn border border-red bg-red/10 text-red-bright">
            <ArrowRight size={17} strokeWidth={2.2} />
          </span>
        </button>
      )}
    </section>
  )
}
