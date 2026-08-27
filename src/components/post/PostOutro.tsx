import { Bookmark, BookmarkCheck, Send } from 'lucide-react'
import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/cn'
import type { Post } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'
import { haptic, sharePost } from '@/platform/telegram'
import { PostRow } from './PostRow'

interface PostOutroProps {
  post: Post
  /** Следующий пост того же направления. Нет — конец, и это нормально. */
  next: Post | null
}

/**
 * Конец поста.
 *
 * Раньше здесь стояла одна кнопка «к каталогу» — то есть последним, что
 * человек видел после полезного текста, была навигация. Теперь конец
 * предлагает три вещи, которые он в этот момент действительно может
 * захотеть: читать дальше, отдать пост коллеге, вернуться к нему позже.
 *
 * Кнопки «к каталогу» здесь нет намеренно: каталог всегда лежит в таб-баре,
 * а прежняя вела не назад, а в другое место — и называла это «назад».
 */
export function PostOutro({ post, next }: PostOutroProps) {
  return (
    <div className="mt-12">
      <div className="mx-5 mb-7 h-px bg-hairline" />

      {next && (
        <section className="mb-7">
          <SectionHeader title="дальше" />
          <div className="px-5">
            <PostRow post={next} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-2.5 px-5">
        <ShareAction post={post} />
        <SaveAction postId={post.id} />
      </div>
    </div>
  )
}

/** Общая геометрия двух финальных действий: одинаковый вес, одинаковый рост. */
const ACTION =
  'press flex min-h-11 items-center justify-center gap-2 rounded-btn border label transition-colors duration-200'

function ShareAction({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        haptic('tap')
        void sharePost(post.slug, post.title).then((ok) => setFailed(!ok))
      }}
      className={cn(
        ACTION,
        failed ? 'border-warn/50 text-warn' : 'border-hairline bg-inset text-dim',
      )}
    >
      <Send size={14} strokeWidth={2.2} />
      {failed ? 'не вышло' : 'в чат'}
    </button>
  )
}

function SaveAction({ postId }: { postId: string }) {
  const saved = useLibraryStore((s) => s.saved.includes(postId))
  const toggle = useLibraryStore((s) => s.toggleSaved)
  const [full, setFull] = useState(false)

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        const result = toggle(postId)
        setFull(result === 'full')
        haptic(result === 'full' ? 'warning' : result === 'saved' ? 'success' : 'tap')
      }}
      className={cn(
        ACTION,
        full
          ? 'border-warn/50 text-warn'
          : saved
            ? 'border-accent bg-accent/[0.07] text-accent-bright'
            : 'border-hairline bg-inset text-dim',
      )}
    >
      {saved ? <BookmarkCheck size={14} strokeWidth={2.2} /> : <Bookmark size={14} strokeWidth={2.2} />}
      {full ? 'не поместилось' : saved ? 'сохранено' : 'сохранить'}
    </button>
  )
}
