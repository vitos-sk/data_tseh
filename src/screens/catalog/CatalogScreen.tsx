import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { CategoryIcon } from '@/components/course/CategoryIcon'
import { CourseRow } from '@/components/course/CourseRow'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchField } from '@/components/ui/SearchField'
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORIES } from '@/data/categories'
import { pluralLessons } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository, type Course } from '@/modules/catalog'

export function CatalogScreen() {
  const [query, setQuery] = useState('')
  const searching = query.trim().length > 0

  const { data: courses, loading } = useAsync(
    () => (searching ? catalogRepository.searchCourses(query) : catalogRepository.getCourses()),
    [query],
  )

  return (
    <Screen title="Каталог" subtitle="Пять направлений, короткие курсы без воды">
      <div className="mb-6 px-5">
        <SearchField value={query} onChange={setQuery} placeholder="Найти курс или тему" />
      </div>

      {loading && (
        <div className="flex flex-col gap-3 px-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {!loading && searching && <SearchResults courses={courses ?? []} />}
      {!loading && !searching && <GroupedCourses courses={courses ?? []} />}
    </Screen>
  )
}

/** Результаты поиска — плоским списком: группировка тут только мешает. */
function SearchResults({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<SearchX size={26} />}
        title="Ничего не нашлось"
        text="Попробуйте другое слово — или загляните в направления ниже, там всего тринадцать курсов."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2.5 px-5">
      <p className="px-1 pb-1 text-[13px] text-muted">
        {courses.length === 1 ? 'Один курс' : `Курсов: ${courses.length}`}
      </p>
      {courses.map((course) => (
        <CourseRow key={course.id} course={course} />
      ))}
    </div>
  )
}

/** Обычный вид каталога: курсы, сгруппированные по направлениям. */
function GroupedCourses({ courses }: { courses: Course[] }) {
  return (
    <div className="flex flex-col gap-9">
      {CATEGORIES.map((category) => {
        const list = courses.filter((c) => c.categoryId === category.id)
        if (list.length === 0) return null

        const totalLessons = list.reduce((sum, c) => sum + c.lessonsCount, 0)

        return (
          <section key={category.id}>
            <div className="mb-3.5 flex items-center gap-3 px-5">
              <CategoryIcon category={category} />
              <div className="min-w-0">
                <h2 className="text-[20px] leading-tight font-bold tracking-[-0.02em]">
                  {category.title}
                </h2>
                <p className="mt-0.5 truncate text-[13.5px] text-muted">
                  {list.length === 1 ? '1 курс' : `${list.length} курса`} ·{' '}
                  {pluralLessons(totalLessons)}
                </p>
              </div>
            </div>

            <p className="mb-3 px-5 text-[14.5px] leading-relaxed text-muted">
              {category.description}
            </p>

            <div className="flex flex-col gap-2.5 px-5">
              {list.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
