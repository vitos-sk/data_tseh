import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatReadTime } from '@/lib/format'
import type { Post } from '@/modules/catalog'
import { haptic } from '@/platform/telegram'
import { CategoryIcon } from './CategoryIcon'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

/**
 * Крупная карточка для ленты на Главной.
 *
 * Открывает карточку ссылка в заголовке, растянутая псевдоэлементом на всю
 * площадь: карточка остаётся кликабельной целиком, но при этом достижима
 * с клавиатуры и читается скринридером как ссылка, а не как безымянный блок.
 */
export function PostCard({ post }: { post: Post }) {
  const category = CATEGORY_BY_ID[post.categoryId]

  return (
    <article className="glass glass-live relative rounded-card p-2.5">
      <CoverArt cover={post.cover} className="h-44 rounded-[2px]">
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-end">
          {/* Поверх растянутой ссылки: иначе закладка была бы недостижима */}
          <div className="relative z-10">
            <SaveButton postId={post.id} />
          </div>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-1.5">
          <Badge tone="glass">{formatReadTime(post.readMin)}</Badge>
        </div>
      </CoverArt>

      <div className="flex items-start gap-3 px-1 pt-3.5 pb-1">
        <CategoryIcon category={category} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="type-ui leading-snug font-bold tracking-[0.04em]">
            <Link
              to={`/p/${post.slug}`}
              onClick={() => haptic('tap')}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {post.title}
            </Link>
          </h3>
          <p className="type-body mt-1.5 line-clamp-2 text-dim">{post.subtitle}</p>
        </div>
      </div>
    </article>
  )
}
