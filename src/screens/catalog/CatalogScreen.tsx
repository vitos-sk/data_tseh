import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { CategoryIcon } from '@/components/post/CategoryIcon'
import { PostRow } from '@/components/post/PostRow'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchField } from '@/components/ui/SearchField'
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORIES } from '@/data/categories'
import { pluralPosts } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository, type Post } from '@/modules/catalog'

export function CatalogScreen() {
  const [query, setQuery] = useState('')
  const searching = query.trim().length > 0

  const { data: posts, loading } = useAsync(
    () => (searching ? catalogRepository.searchPosts(query) : catalogRepository.getPosts()),
    [query],
  )

  return (
    <Screen title="каталог" subtitle="Пять направлений, посты без воды">
      <div className="mb-6 px-5">
        <SearchField value={query} onChange={setQuery} placeholder="найти пост или тему" />
      </div>

      {loading && (
        <div className="flex flex-col gap-3 px-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))}
        </div>
      )}

      {!loading && searching && <SearchResults posts={posts ?? []} />}
      {!loading && !searching && <GroupedPosts posts={posts ?? []} />}
    </Screen>
  )
}

/** Результаты поиска — плоским списком: группировка тут только мешает. */
function SearchResults({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<SearchX size={26} />}
        title="ничего не нашлось"
        text="Попробуйте другое слово — или загляните в направления ниже."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2.5 px-5">
      <p className="label px-1 pb-1 text-dim">
        {posts.length === 1 ? 'найден один пост' : `найдено постов: ${posts.length}`}
      </p>
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </div>
  )
}

/** Обычный вид каталога: посты, сгруппированные по направлениям. */
function GroupedPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col gap-9">
      {CATEGORIES.map((category) => {
        const list = posts.filter((p) => p.categoryId === category.id)
        if (list.length === 0) return null

        return (
          <section key={category.id}>
            <div className="mb-3.5 flex items-center gap-3 px-5">
              <CategoryIcon category={category} />
              <div className="min-w-0">
                <h2 className="text-[17px] leading-tight font-bold tracking-[0.14em] lowercase">
                  {category.title}
                </h2>
                <p className="mt-1 truncate text-[11.5px] tracking-[0.02em] text-dim">
                  {pluralPosts(list.length)}
                </p>
              </div>
            </div>

            <p className="mb-3.5 px-5 text-[13px] leading-[1.7] tracking-[0.02em] text-dim">
              {category.description}
            </p>

            <div className="flex flex-col gap-2.5 px-5">
              {list.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
