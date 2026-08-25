import { useNavigate } from 'react-router-dom'
import { CATEGORY_BY_ID } from '@/data/categories'
import { formatReadTime } from '@/lib/format'
import type { Post } from '@/modules/catalog'
import { haptic } from '@/platform/telegram'
import { CoverArt } from './CoverArt'
import { SaveButton } from './SaveButton'

/**
 * Компактная строка поста: каталог и закладки.
 *
 * Здесь плоская поверхность вместо стекла: строк на экране много,
 * а backdrop-filter на каждой заметно просаживает средний Android.
 * Разницу видно только рядом с матрицей — на этих экранах её нет.
 */
export function PostRow({ post }: { post: Post }) {
  const navigate = useNavigate()

  return (
    <article
      onClick={() => {
        haptic('tap')
        navigate(`/p/${post.slug}`)
      }}
      className="glass-live flex cursor-pointer items-center gap-3 rounded-card border border-hairline bg-surface p-2.5"
    >
      <CoverArt cover={post.cover} className="size-16 shrink-0 rounded-[2px]" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14.5px] font-bold tracking-[0.04em]">{post.title}</h3>
        <p className="mt-1 truncate text-[12px] tracking-[0.02em] text-dim">
          {CATEGORY_BY_ID[post.categoryId].title} · {formatReadTime(post.readMin)}
        </p>
      </div>

      <SaveButton postId={post.id} variant="inset" />
    </article>
  )
}
