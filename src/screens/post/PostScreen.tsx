import { ArrowLeft, Compass } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BlockRenderer } from '@/components/post/BlockRenderer'
import { CategoryIcon } from '@/components/post/CategoryIcon'
import { CoverArt } from '@/components/post/CoverArt'
import { PostOutro } from '@/components/post/PostOutro'
import { SaveButton } from '@/components/post/SaveButton'
import { Screen } from '@/components/layout/Screen'
import { Terminal } from '@/components/fx/Terminal'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadError } from '@/components/ui/LoadError'
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatReadTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { cachePost, catalogRepository, readCachedPost } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'
import { isInsideTelegram, useBackButton } from '@/platform/telegram'

/**
 * Пост целиком: одна страница, один заход. Ни программы, ни переходов между
 * частями, ни прогресса — читать нечего, кроме самого текста
 * (docs/decisions/0010).
 */
export function PostScreen() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const { data: fetched, loading, error, retry } = useAsync(
    () => catalogRepository.getPost(slug),
    [slug],
  )

  // Копия на устройстве. Читается только когда сеть не ответила: пока она
  // отвечает, показывать устаревший текст незачем.
  const cached = useMemo(() => readCachedPost(slug), [slug])
  const post = fetched ?? (error ? cached : null)
  const offline = Boolean(error && post)

  // Каждый открытый пост оседает на устройстве — это и есть то, что делает
  // закладку читаемой в метро.
  useEffect(() => {
    if (fetched) cachePost(fetched)
  }, [fetched])

  const { data: next } = useAsync(
    () =>
      post
        ? catalogRepository.getNextPost(post.categoryId, post.id)
        : Promise.resolve(null),
    [post?.id],
  )

  const setLastOpened = useLibraryStore((s) => s.setLastOpened)
  const postId = post?.id ?? null

  // Открытый пост — точка возврата для блока «Недавнее» на Главной.
  useEffect(() => {
    if (postId) setLastOpened(postId)
  }, [postId, setLastOpened])

  const goBack = () => navigate(-1)
  useBackButton(goBack)

  if (loading) {
    return (
      <Screen withTabBar={false}>
        <Skeleton className="h-60 w-full rounded-none" />
        <div className="flex flex-col gap-3 p-5">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Screen>
    )
  }

  // Сеть упала и копии нет. Раньше здесь было «пост не найден» — приложение
  // сообщало об удалении там, где всего лишь пропала связь.
  if (error && !post) {
    return (
      <Screen withTabBar={false}>
        <LoadError what="пост" onRetry={retry} />
      </Screen>
    )
  }

  if (!post) {
    return (
      <Screen withTabBar={false}>
        <EmptyState
          icon={<Compass size={24} />}
          title="пост не найден"
          text="Похоже, его переименовали или сняли с публикации."
          action={
            <button type="button" onClick={goBack} className="btn-arm">
              назад
            </button>
          }
        />
      </Screen>
    )
  }

  const category = CATEGORY_BY_ID[post.categoryId]

  return (
    <div className="min-h-full pb-[calc(var(--tabbar-height)+var(--safe-bottom)+32px)]">
      <CoverArt cover={post.cover} className="h-60">
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
              className="press relative flex size-9 items-center justify-center rounded-btn border border-hairline bg-black/50 text-fg backdrop-blur-sm after:absolute after:-inset-1.5 after:content-['']"
            >
              <ArrowLeft size={17} />
            </button>
          ) : (
            <span />
          )}
          <SaveButton postId={post.id} />
        </div>
      </CoverArt>

      <header className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <CategoryIcon category={category} />
          <div className="min-w-0 flex-1">
            <h1 className="type-title font-extrabold tracking-[0.08em]">{post.title}</h1>
            {post.subtitle && (
              <p className="type-body mt-2 text-dim">{post.subtitle}</p>
            )}
          </div>
        </div>

        <p className="label mt-4 text-dim">
          {category.title} · {formatReadTime(post.readMin)}
        </p>
      </header>

      {offline && (
        <div className="mt-5 px-5">
          <Terminal caret={false} lines={['сети нет — открыта сохранённая копия']} />
        </div>
      )}

      <article className="mt-8 px-5">
        <BlockRenderer blocks={post.blocks} />
      </article>

      <PostOutro post={post} next={next ?? null} />
    </div>
  )
}
