import { Link } from 'react-router-dom'
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
 *
 * Кликает не сама строка, а ссылка в заголовке, растянутая на всю карточку
 * псевдоэлементом. Так строка открывается и пальцем, и с клавиатуры,
 * и скринридер называет её ссылкой — а закладка остаётся отдельной целью
 * поверх неё.
 */
export function PostRow({ post }: { post: Post }) {
  return (
    <article className="glass-live relative flex items-center gap-3 rounded-card border border-hairline bg-surface p-2.5">
      <CoverArt cover={post.cover} className="size-16 shrink-0 rounded-[2px]" />

      <div className="min-w-0 flex-1">
        <h3 className="type-ui truncate font-bold tracking-[0.04em]">
          <Link
            to={`/p/${post.slug}`}
            onClick={() => haptic('tap')}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>
        <p className="type-caption mt-1 truncate tracking-[0.02em] text-dim">
          {CATEGORY_BY_ID[post.categoryId].title} · {formatReadTime(post.readMin)}
        </p>
      </div>

      {/* Поверх растянутой ссылки: иначе закладка была бы недостижима */}
      <div className="relative z-10">
        <SaveButton postId={post.id} variant="inset" />
      </div>
    </article>
  )
}
