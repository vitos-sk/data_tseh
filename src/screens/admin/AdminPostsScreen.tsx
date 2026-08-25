import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CoverArt } from '@/components/post/CoverArt'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatReadTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminRepository, type AdminPost } from '@/modules/admin/admin.repository'
import { adminPath } from './adminPath'

type PostRowData = Omit<AdminPost, 'blocks'>

export function AdminPostsScreen() {
  const navigate = useNavigate()
  const [reloadKey, setReloadKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: posts, loading } = useAsync(() => adminRepository.listPosts(), [reloadKey])
  const { data: categories } = useAsync(() => adminRepository.listCategories(), [])

  const createPost = async () => {
    if (!categories || categories.length === 0) {
      setError('Сначала нужна хотя бы одна категория')
      return
    }
    setCreating(true)
    setError(null)

    try {
      const post = await adminRepository.createPost(categories[0].id)
      navigate(adminPath(`/post/${post.id}`))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не получилось')
      setReloadKey((k) => k + 1)
    } finally {
      setCreating(false)
    }
  }

  const drafts = posts?.filter((p) => !p.published) ?? []
  const published = posts?.filter((p) => p.published) ?? []

  return (
    <div className="pt-5">
      <div className="mb-5 flex items-center justify-between gap-3 px-5">
        <h1 className="text-[24px] leading-tight font-extrabold tracking-[0.14em] lowercase">
          посты
        </h1>
        <button
          type="button"
          disabled={creating}
          onClick={() => void createPost()}
          className="press flex items-center gap-1.5 rounded-btn bg-red px-4 py-2.5 text-[15px] font-semibold text-white disabled:opacity-40"
        >
          <Plus size={17} strokeWidth={2.6} />
          Создать
        </button>
      </div>

      {error && <p className="mb-4 px-5 text-[14px] leading-snug text-red-bright">{error}</p>}

      {loading && (
        <div className="flex flex-col gap-2.5 px-5">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {!loading && posts?.length === 0 && (
        <EmptyState
          icon={<FileText size={26} />}
          title="Постов пока нет"
          text="Создайте первый — он появится в приложении, когда вы его опубликуете."
        />
      )}

      {!loading && drafts.length > 0 && (
        <Section title="Черновики" hint="Видны только вам">
          {drafts.map((post) => (
            <AdminPostRow key={post.id} post={post} />
          ))}
        </Section>
      )}

      {!loading && published.length > 0 && (
        <Section title="Опубликованы">
          {published.map((post) => (
            <AdminPostRow key={post.id} post={post} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <div className="mb-2.5 flex items-baseline gap-2 px-5">
        <h2 className="text-[13px] font-semibold tracking-wide text-dim uppercase">{title}</h2>
        {hint && <span className="text-[12.5px] text-dim">· {hint}</span>}
      </div>
      <div className="flex flex-col gap-2.5 px-5">{children}</div>
    </section>
  )
}

function AdminPostRow({ post }: { post: PostRowData }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(adminPath(`/post/${post.id}`))}
      className="press flex items-center gap-3.5 rounded-[var(--radius-card)] bg-surface p-3 text-left"
    >
      <CoverArt cover={post.cover} className="size-12 shrink-0 rounded-xl" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold">{post.title}</span>
        <span className="mt-0.5 block truncate text-[13px] text-dim">
          {formatReadTime(post.readMin)}
        </span>
      </span>

      {!post.published && <Badge tone="neutral">Черновик</Badge>}
    </button>
  )
}
