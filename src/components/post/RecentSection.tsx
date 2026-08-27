import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatReadTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'
import { CoverArt } from './CoverArt'

/**
 * Секция «Недавнее» целиком, вместе с заголовком. Показывается, только когда
 * есть куда возвращаться: иначе на Главной висел бы пустой заголовок.
 */
export function RecentSection() {
  const navigate = useNavigate()
  const hydrated = useLibraryStore((s) => s.hydrated)
  const lastOpened = useLibraryStore((s) => s.lastOpened)
  const postId = lastOpened?.postId ?? null

  const { data: post } = useAsync(
    () => (postId ? catalogRepository.getPostById(postId) : Promise.resolve(null)),
    [postId],
  )

  // Пока закладки едут из хранилища, ничего не обещаем: показать заголовок
  // и тут же его убрать хуже, чем показать на пару сотен миллисекунд позже.
  if (!hydrated || !lastOpened) return null

  return (
    <section className="pt-5">
      <SectionHeader title="недавнее" />

      {!post ? (
        <Skeleton className="mx-5 h-[82px]" />
      ) : (
        <button
          type="button"
          onClick={() => {
            haptic('tap')
            navigate(`/p/${post.slug}`)
          }}
          className="glass glass-live mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-card p-2.5 text-left"
        >
          <CoverArt cover={post.cover} className="size-14 shrink-0 rounded-[2px]" />

          <div className="min-w-0 flex-1">
            <p className="truncate type-ui font-bold tracking-[0.04em]">{post.title}</p>
            <p className="label mt-2 truncate text-dim">{formatReadTime(post.readMin)}</p>
          </div>

          <span className="flex size-10 shrink-0 items-center justify-center rounded-btn border border-accent bg-accent/[0.07] text-accent-bright">
            <ArrowRight size={17} strokeWidth={2.2} />
          </span>
        </button>
      )}
    </section>
  )
}
