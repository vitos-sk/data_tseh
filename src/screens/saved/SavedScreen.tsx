import { BookmarkPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CourseRow } from '@/components/course/CourseRow'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'

export function SavedScreen() {
  const navigate = useNavigate()
  const hydrated = useLibraryStore((s) => s.hydrated)
  const saved = useLibraryStore((s) => s.saved)

  // Экран — то самое место, где сходятся «Личное» и «Каталог»:
  // стор хранит только id, содержимое приезжает из репозитория.
  const { data: courses, loading } = useAsync(
    () => catalogRepository.getCoursesByIds(saved),
    [saved.join(',')],
  )

  const busy = !hydrated || loading

  return (
    <Screen title="Сохранённое" subtitle="Курсы, к которым вы хотите вернуться">
      {busy && (
        <div className="flex flex-col gap-2.5 px-5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {!busy && saved.length === 0 && (
        <EmptyState
          icon={<BookmarkPlus size={26} />}
          title="Пока ничего не сохранено"
          text="Нажмите на закладку у любого курса — он появится здесь и не потеряется."
          action={
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="press rounded-full bg-cta px-6 py-3 text-[16px] font-semibold text-bg"
            >
              Открыть каталог
            </button>
          }
        />
      )}

      {!busy && saved.length > 0 && (
        <div className="flex flex-col gap-2.5 px-5">
          {courses?.map((course) => <CourseRow key={course.id} course={course} />)}
        </div>
      )}
    </Screen>
  )
}
