import { ArrowLeft, Check } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BlockRenderer } from '@/components/lesson/BlockRenderer'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDuration } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository, type Lesson } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'
import { haptic, isInsideTelegram, useBackButton, useMainButton } from '@/platform/telegram'

export function LessonScreen() {
  const { slug = '', lessonId = '' } = useParams()
  const navigate = useNavigate()

  const { data: course } = useAsync(() => catalogRepository.getCourseBySlug(slug), [slug])
  const { data: lessons } = useAsync(
    () => (course ? catalogRepository.getLessons(course.id) : Promise.resolve<Lesson[]>([])),
    [course?.id],
  )

  const markDone = useLibraryStore((s) => s.markLessonDone)
  const setLastOpened = useLibraryStore((s) => s.setLastOpened)
  const done = useLibraryStore((s) =>
    course ? (s.completed[course.id]?.includes(lessonId) ?? false) : false,
  )

  const lesson = lessons?.find((l) => l.id === lessonId) ?? null
  const index = lessons?.findIndex((l) => l.id === lessonId) ?? -1
  const next = index >= 0 ? (lessons?.[index + 1] ?? null) : null

  const courseId = course?.id ?? null
  const openedLessonId = lesson?.id ?? null

  // Открытый урок — точка возврата для блока «Продолжить» на Главной.
  useEffect(() => {
    if (courseId && openedLessonId) setLastOpened(courseId, openedLessonId)
  }, [courseId, openedLessonId, setLastOpened])

  const goBack = () => navigate(`/course/${slug}`)
  useBackButton(goBack)

  const finish = () => {
    if (!course || !lesson) return
    haptic('success')
    markDone(course.id, lesson.id)

    if (next) {
      navigate(`/course/${slug}/lesson/${next.id}`, { replace: true })
    } else {
      goBack()
    }
  }

  const actionLabel = next ? (done ? 'Следующий урок' : 'Готово, дальше') : 'Завершить курс'

  useMainButton({ text: actionLabel, visible: Boolean(lesson), onClick: finish })

  if (!lesson || !course) {
    return (
      <div className="flex flex-col gap-4 p-5 pt-[calc(var(--safe-top)+24px)]">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  const positionLabel = `Урок ${lesson.order} из ${course.lessonsCount}`

  return (
    <div className="min-h-full pb-[calc(var(--tabbar-height)+var(--safe-bottom)+40px)]">
      <header
        className="sticky top-0 z-30 bg-bg/90 px-5 pb-3 backdrop-blur-xl"
        style={{ paddingTop: 'calc(var(--safe-top) + 12px)' }}
      >
        <div className="flex items-center gap-3">
          {!isInsideTelegram() && (
            <button
              type="button"
              onClick={goBack}
              aria-label="К программе курса"
              className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-inset text-muted"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-muted">{course.title}</p>
            <p className="text-[14px] font-semibold">{positionLabel}</p>
          </div>
          {done && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-bg">
              <Check size={15} strokeWidth={3} />
            </span>
          )}
        </div>
        <ProgressBar value={lesson.order / course.lessonsCount} className="mt-3 h-1" />
      </header>

      <article className="px-5 pt-5">
        <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.03em]">
          {lesson.title}
        </h1>
        <p className="mt-2 mb-7 text-[14px] text-muted">
          {formatDuration(lesson.durationMin)} чтения
        </p>

        <BlockRenderer blocks={lesson.blocks} />
      </article>

      {!isInsideTelegram() && (
        <div className="mt-9 px-5">
          <button
            type="button"
            onClick={finish}
            className="press w-full rounded-full bg-cta py-4 text-[17px] font-semibold text-bg"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}
