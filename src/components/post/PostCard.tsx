import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatReadTime } from '@/lib/format'
import type { Post } from '@/modules/catalog'
import { haptic } from '@/platform/telegram'
import { CategoryIcon } from './CategoryIcon'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

/** Крупная карточка для ленты на Главной. */
export function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate()
  const category = CATEGORY_BY_ID[post.categoryId]

  return (
    <article
      onClick={() => {
        haptic('tap')
        navigate(`/p/${post.slug}`)
      }}
      className="glass glass-live cursor-pointer rounded-card p-2.5"
    >
      <CoverArt cover={post.cover} className="h-44 rounded-[2px]">
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-end">
          <SaveButton postId={post.id} />
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-1.5">
          <Badge tone="glass">{formatReadTime(post.readMin)}</Badge>
        </div>
      </CoverArt>

      <div className="flex items-start gap-3 px-1 pt-3.5 pb-1">
        <CategoryIcon category={category} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15.5px] leading-snug font-bold tracking-[0.04em]">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.6] text-dim">{post.subtitle}</p>
        </div>
      </div>
    </article>
  )
}
