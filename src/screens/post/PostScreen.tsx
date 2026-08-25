import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BlockRenderer } from '@/components/post/BlockRenderer'
import { CategoryIcon } from '@/components/post/CategoryIcon'
import { CoverArt } from '@/components/post/CoverArt'
import { SaveButton } from '@/components/post/SaveButton'
import { Screen } from '@/components/layout/Screen'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatReadTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'
import { isInsideTelegram, useBackButton } from '@/platform/telegram'

const BADGE_LABEL = { new: 'Новое', free: 'Бесплатно' } as const

/**
 * Пост целиком: одна страница, один заход. Ни программы, ни переходов между
 * частями, ни прогресса — читать нечего, кроме самого текста
 * (docs/decisions/0010).
 */
export function PostScreen() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const { data: post, loading } = useAsync(() => catalogRepository.getPost(slug), [slug])

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

  if (!post) {
    return (
      <Screen title="пост не найден" withTabBar={false}>
        <div className="px-5">
          <button type="button" onClick={goBack} className="btn-arm">
            назад
          </button>
        </div>
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
              className="press flex size-9 items-center justify-center rounded-btn border border-hairline bg-black/50 text-fg backdrop-blur-sm"
            >
              <ArrowLeft size={17} />
            </button>
          ) : (
            <span />
          )}
          <SaveButton postId={post.id} />
        </div>

        {post.badges.length > 0 && (
          <div className="absolute inset-x-5 bottom-4 flex flex-wrap gap-1.5">
            {post.badges.map((badge) => (
              <Badge key={badge} tone={badge === 'new' ? 'red' : 'glass'}>
                {BADGE_LABEL[badge]}
              </Badge>
            ))}
          </div>
        )}
      </CoverArt>

      <header className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <CategoryIcon category={category} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] leading-[1.25] font-extrabold tracking-[0.08em]">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="mt-2 text-[13px] leading-[1.7] tracking-[0.02em] text-dim">
                {post.subtitle}
              </p>
            )}
          </div>
        </div>

        <p className="label mt-4 text-dim">
          {category.title} · {formatReadTime(post.readMin)}
        </p>
      </header>

      <article className="mt-8 px-5">
        <BlockRenderer blocks={post.blocks} />
      </article>

      <div className="mt-12 px-5">
        <div className="mb-6 h-px bg-hairline" />
        <button type="button" onClick={() => navigate('/catalog')} className="btn-arm w-full">
          к каталогу
        </button>
      </div>
    </div>
  )
}
