import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { CategoryFilter, type CategoryFilterValue } from '@/components/course/CategoryFilter'
import { ContinueSection } from '@/components/course/ContinueSection'
import { CourseCard } from '@/components/course/CourseCard'
import { GlitchText } from '@/components/fx/GlitchText'
import { Terminal } from '@/components/fx/Terminal'
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
      <div className="relative">
        <header className="px-5 pt-3 pb-6">
          <p className="label mb-4 text-dim">
            <span className="pulsar mr-2 inline-block size-1.5 rounded-full bg-ok align-middle text-ok" />
            online
          </p>

          {/*
            Логотип-герой: строчная развёртка залита в сам текст через
            background-clip, а глитч-двойники поверх остаются сплошными —
            иначе в момент рывка буквы теряются совсем.
          */}
          <h1 className="scanline-text text-[54px] leading-none font-extrabold tracking-[0.16em] uppercase">
            <GlitchText>ЦЕХ</GlitchText>
          </h1>

          <p className="mt-4 text-[13px] leading-[1.7] tracking-[0.02em] text-dim">
            короткие курсы без воды
          </p>
        </header>

        <div className="mb-6 px-5">
          <Terminal
            lines={[
              user ? `здравствуйте, ${user.first_name}` : 'здравствуйте, гость',
              'чему научимся сегодня?',
            ]}
          />
        </div>

        <CategoryFilter value={filter} onChange={setFilter} />

        {filter === 'all' && <ContinueSection />}

        <section className="pt-7">
          <SectionHeader title={filter === 'all' ? 'рекомендуем' : 'направление'} />

          <div className="flex flex-col gap-3 px-5">
            {loading && (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            )}

            {!loading && courses?.length === 0 && (
              <EmptyState
                icon={<SearchX size={24} />}
                title="тут пока пусто"
                text="В этом направлении ещё нет курсов. Загляните в другое — там есть что почитать."
              />
            )}

            {!loading && courses?.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      </div>
    </Screen>
  )
}
