import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { CategoryFilter, type CategoryFilterValue } from '@/components/course/CategoryFilter'
import { ContinueSection } from '@/components/course/ContinueSection'
import { CourseCard } from '@/components/course/CourseCard'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { getTelegramUser } from '@/platform/telegram'

export function HomeScreen() {
  const [filter, setFilter] = useState<CategoryFilterValue>('all')
  const user = getTelegramUser()

  const { data: courses, loading } = useAsync(
    () => catalogRepository.getCourses(filter === 'all' ? undefined : filter),
    [filter],
  )

  return (
    <Screen>
      <header className="px-5 pt-2 pb-4">
        <p className="text-[15px] font-medium text-muted">
          {user ? `Привет, ${user.first_name}` : 'Привет'}
        </p>
        <h1 className="mt-1 text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em]">
          Чему научимся
          <br />
          сегодня?
        </h1>
      </header>

      <CategoryFilter value={filter} onChange={setFilter} />

      {filter === 'all' && <ContinueSection />}

      <section className="pt-6">
        <SectionHeader title={filter === 'all' ? 'Рекомендуем' : 'Курсы направления'} />

        <div className="flex flex-col gap-3.5 px-5">
          {loading && (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          )}

          {!loading && courses?.length === 0 && (
            <EmptyState
              icon={<SearchX size={26} />}
              title="Тут пока пусто"
              text="В этом направлении ещё нет курсов. Загляните в другое — там есть что почитать."
            />
          )}

          {!loading && courses?.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
    </Screen>
  )
}
