import { SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CategoryFilter, type CategoryFilterValue } from '@/components/post/CategoryFilter'
import { PostCard } from '@/components/post/PostCard'
import { RecentSection } from '@/components/post/RecentSection'
import { GlitchText } from '@/components/fx/GlitchText'
import { Terminal } from '@/components/fx/Terminal'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadError } from '@/components/ui/LoadError'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PostCardSkeleton } from '@/components/ui/Skeleton'
import { CATEGORIES, CATEGORY_BY_ID } from '@/data/categories'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { getTelegramUser } from '@/platform/telegram'

const IDS = new Set<string>(CATEGORIES.map((c) => c.id))

export function HomeScreen() {
  const user = getTelegramUser()

  /*
   * Фильтр живёт в адресе, а не в useState: открыл пост, вернулся назад —
   * и направление осталось выбранным. Локальное состояние сбрасывалось
   * при каждом возврате, и человек каждый раз начинал с «Всё».
   */
  const [params, setParams] = useSearchParams()
  const raw = params.get('c') ?? ''
  const filter: CategoryFilterValue = IDS.has(raw) ? (raw as CategoryFilterValue) : 'all'

  const setFilter = (value: CategoryFilterValue) => {
    // replace, а не push: перебор чипов не должен набивать историю браузера,
    // иначе нативная «назад» в Telegram уводит по вкладкам фильтра.
    setParams(value === 'all' ? {} : { c: value }, { replace: true })
  }

  const { data: posts, loading, error, retry } = useAsync(
    () => catalogRepository.getPosts(filter === 'all' ? undefined : filter),
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

          <p className="type-body mt-4 tracking-[0.02em] text-dim">посты без воды</p>
        </header>

        <div className="mb-6 px-5">
          <Terminal
            lines={[
              // Без имени — просто «здравствуйте». Прежнее «здравствуйте, гость»
              // первым делом отказывало человеку в том, что он свой.
              user ? `здравствуйте, ${user.first_name}` : 'здравствуйте',
              'что почитаем сегодня?',
            ]}
          />
        </div>

        <CategoryFilter value={filter} onChange={setFilter} />

        {filter === 'all' && <RecentSection />}

        <section className="pt-7">
          {/* Заголовок называет то, что под ним лежит. «Рекомендуем» обещало
              отбор, которого нет: список идёт в редакторском порядке. */}
          <SectionHeader title={filter === 'all' ? 'все посты' : CATEGORY_BY_ID[filter].title} />

          <div className="flex flex-col gap-3 px-5">
            {loading && (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            )}

            {!loading && error && <LoadError what="ленту" onRetry={retry} />}

            {!loading && !error && posts?.length === 0 && (
              <EmptyState
                icon={<SearchX size={24} />}
                title="тут пока пусто"
                text="В этом направлении ещё нет постов. Загляните в другое — там есть что почитать."
              />
            )}

            {!loading && !error && posts?.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      </div>
    </Screen>
  )
}
