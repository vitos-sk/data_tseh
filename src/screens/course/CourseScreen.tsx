import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CategoryIcon } from '@/components/course/CategoryIcon'
import { CoverArt } from '@/components/course/CoverArt'
import { LessonRow } from '@/components/course/LessonRow'
import { SaveButton } from '@/components/course/SaveButton'
import { Screen } from '@/components/layout/Screen'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatDuration, formatLevel, pluralLessons } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository, type Lesson } from '@/modules/catalog'
import { progressOf, selectCompletedIds, useLibraryStore } from '@/modules/library'
import { haptic, isInsideTelegram, useBackButton, useMainButton } from '@/platform/telegram'

const BADGE_LABEL = { new: 'Новое', free: 'Бесплатно' } as const

export function CourseScreen() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const { data: course, loading } = useAsync(() => catalogRepository.getCourseBySlug(slug), [slug])
  const { data: lessons } = useAsync(
    () => (course ? catalogRepository.getLessons(course.id) : Promise.resolve<Lesson[]>([])),
    [course?.id],
  )

  const hydrated = useLibraryStore((s) => s.hydrated)
  const completedIds = useLibraryStore(selectCompletedIds(course?.id ?? ''))

  const goBack = () => navigate(-1)
  useBackButton(goBack)

  // Продолжаем с первого непройденного урока; всё пройдено — с первого.
  const nextLesson = lessons?.find((l) => !completedIds.includes(l.id)) ?? lessons?.[0] ?? null
  const openLesson = (lessonId: string) => {
    haptic('tap')
    navigate(`/course/${slug}/lesson/${lessonId}`)
  }

  const started = completedIds.length > 0
  useMainButton({
    text: started ? 'Продолжить' : 'Начать курс',
    visible: Boolean(nextLesson),
    onClick: () => nextLesson && openLesson(nextLesson.id),
  })

  if (loading) {
    return (
      <Screen withTabBar={false}>
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="flex flex-col gap-3 p-5">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Screen>
    )
  }

  if (!course) {
    return (
      <Screen title="Курс не найден" withTabBar={false}>
        <button
          type="button"
          onClick={goBack}
          className="press mx-5 rounded-full bg-cta px-6 py-3 text-[16px] font-semibold text-bg"
        >
          Назад
        </button>
      </Screen>
    )
  }

  const category = CATEGORY_BY_ID[course.categoryId]
  const progress = progressOf(completedIds.length, course.lessonsCount)

  return (
    <div className="min-h-full pb-[calc(var(--tabbar-height)+var(--safe-bottom)+32px)]">
      <CoverArt cover={course.cover} className="h-60">
        <div
          className="absolute inset-x-4 flex items-start justify-between"
          style={{ top: 'calc(var(--safe-top) + 12px)' }}
        >
          {/* Внутри Telegram навигацию берёт на себя нативная кнопка «назад» */}
          {!isInsideTelegram() ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Назад"
              className="press flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            >
              <ArrowLeft size={19} />
            </button>
          ) : (
            <span />
          )}
          <SaveButton courseId={course.id} />
        </div>

        <div className="absolute inset-x-5 bottom-4 flex flex-wrap gap-1.5">
          {course.badges.map((badge) => (
            <Badge key={badge} tone={badge === 'new' ? 'gold' : 'glass'}>
              {BADGE_LABEL[badge]}
            </Badge>
          ))}
          <Badge tone="glass">{formatLevel(course.level)}</Badge>
        </div>
      </CoverArt>

      <header className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <CategoryIcon category={category} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-[-0.03em]">
              {course.title}
            </h1>
            <p className="mt-1.5 text-[15px] leading-snug text-muted">{course.subtitle}</p>
          </div>
        </div>

        <p className="mt-3 text-[13.5px] text-muted">
          {course.author} · {pluralLessons(course.lessonsCount)} ·{' '}
          {formatDuration(course.durationMin)}
        </p>
      </header>

      {hydrated && progress > 0 && (
        <div className="mt-5 px-5">
          <div className="rounded-[var(--radius-card)] bg-surface p-4">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-[15px] font-medium">Ваш прогресс</span>
              <span className="text-[15px] font-bold text-gold tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <ProgressBar value={progress} />
            <p className="mt-2.5 text-[13px] text-muted">
              Пройдено {completedIds.length} из {course.lessonsCount}
            </p>
          </div>
        </div>
      )}

      <p className="mt-6 px-5 text-[16px] leading-[1.6] text-white/80">{course.description}</p>

      <section className="mt-7 px-5">
        <h2 className="mb-2 px-1 text-[13px] font-semibold tracking-wide text-muted uppercase">
          Программа
        </h2>
        <div className="rounded-[var(--radius-card)] bg-surface p-1.5">
          {lessons?.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              done={completedIds.includes(lesson.id)}
              current={hydrated && lesson.id === nextLesson?.id && progress < 1}
              onClick={() => openLesson(lesson.id)}
            />
          ))}
        </div>
      </section>

      {/* Вне Telegram нативной главной кнопки нет — рисуем свою */}
      {!isInsideTelegram() && nextLesson && (
        <div className="mt-7 px-5">
          <button
            type="button"
            onClick={() => openLesson(nextLesson.id)}
            className="press w-full rounded-full bg-cta py-4 text-[17px] font-semibold text-bg"
          >
            {started ? 'Продолжить' : 'Начать курс'}
          </button>
        </div>
      )}
    </div>
  )
}
