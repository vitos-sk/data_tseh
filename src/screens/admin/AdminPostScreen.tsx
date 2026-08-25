import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatReadTime } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminRepository, type PostDraft } from '@/modules/admin/admin.repository'
import { estimateReadMin, type PostBlock, type PostBlockKind } from '@/modules/catalog'
import { adminPath } from './adminPath'
import { AddBlockPanel, BlockCard, emptyBlock } from './AdminBlockEditor'
import { AdminPostSettings } from './AdminPostSettings'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Редактор поста: содержание и метаданные на одном экране. Уровня уроков
 * больше нет, и вложенного экрана под него — тоже (docs/decisions/0010).
 *
 * Содержание идёт первым: метаданные задают один раз, текст правят каждый раз.
 */
export function AdminPostScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const { data: post, loading } = useAsync(() => adminRepository.getPost(id), [id])
  const { data: categories } = useAsync(() => adminRepository.listCategories(), [])

  const [draft, setDraft] = useState<PostDraft | null>(null)
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Форма наполняется один раз, когда пост приехал: дальше она живёт сама,
  // иначе каждое обновление данных стирало бы несохранённые правки.
  useEffect(() => {
    if (!post || draft) return
    setDraft({
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      categoryId: post.categoryId,
      cover: post.cover,
      badges: post.badges,
      blocks: post.blocks,
      published: post.published,
    })
  }, [post, draft])

  const patch = (values: Partial<PostDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...values } : prev))
    setState('idle')
  }

  const patchBlocks = (next: (prev: PostBlock[]) => PostBlock[]) => {
    setDraft((prev) => (prev ? { ...prev, blocks: next(prev.blocks) } : prev))
    setState('idle')
  }

  const save = async () => {
    if (!draft) return
    setState('saving')
    setError(null)
    try {
      await adminRepository.updatePost(id, draft)
      setState('saved')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  const remove = async () => {
    try {
      await adminRepository.deletePost(id)
      navigate(adminPath())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  const moveBlock = (index: number, delta: number) =>
    patchBlocks((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  if (loading || !draft) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4 flex items-center gap-2.5 px-5">
        <button
          type="button"
          onClick={() => navigate(adminPath())}
          aria-label="К списку постов"
          className="press flex size-9 shrink-0 items-center justify-center rounded-btn bg-inset text-dim"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-[0.1em] lowercase">
          {draft.title || 'Без названия'}
        </h1>

        <a
          href={`/p/${draft.slug}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Открыть пост"
          className="press flex size-9 shrink-0 items-center justify-center rounded-btn bg-inset text-dim"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="px-5">
        <input
          type="text"
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Название поста"
          className="w-full rounded-btn bg-inset px-4 py-3 text-[18px] font-bold text-fg outline-none placeholder:text-dim"
        />
      </div>

      <section className="mt-7 px-5">
        <div className="mb-2.5 flex items-baseline justify-between px-1">
          <h2 className="text-[13px] font-semibold tracking-wide text-dim uppercase">Содержание</h2>
          <span className="text-[12.5px] text-dim tabular-nums">
            {draft.blocks.length === 0
              ? 'пусто'
              : `блоков: ${draft.blocks.length} · ${formatReadTime(estimateReadMin(draft.blocks))}`}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {draft.blocks.map((block, index) => (
            <BlockCard
              key={index}
              block={block}
              index={index}
              total={draft.blocks.length}
              onChange={(next) =>
                patchBlocks((prev) => prev.map((b, i) => (i === index ? next : b)))
              }
              onMove={(delta) => moveBlock(index, delta)}
              onDelete={() => patchBlocks((prev) => prev.filter((_, i) => i !== index))}
            />
          ))}
        </div>

        <AddBlockPanel
          onAdd={(kind: PostBlockKind) => patchBlocks((prev) => [...prev, emptyBlock(kind)])}
        />
      </section>

      <AdminPostSettings draft={draft} categories={categories ?? []} onPatch={patch} />

      {error && <p className="mt-4 px-5 text-[14px] leading-snug text-red-bright">{error}</p>}

      <DangerZone onDelete={() => void remove()} />

      {/*
        Кнопка сохранения липнет к низу экрана: пост длинный, и уезжающая
        наверх кнопка заставляла прокручивать всё содержание ради сохранения.
      */}
      <div
        className="sticky bottom-0 z-20 mt-8 border-t border-hairline bg-bg/90 px-5 pt-3 backdrop-blur-md"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}
      >
        <button
          type="button"
          onClick={() => void save()}
          disabled={state === 'saving'}
          className="press w-full rounded-btn bg-red py-3.5 text-[16px] font-semibold text-white disabled:opacity-40"
        >
          {state === 'saving'
            ? 'Сохраняем…'
            : state === 'saved'
              ? 'Сохранено'
              : draft.published
                ? 'Сохранить'
                : 'Сохранить черновик'}
        </button>
      </div>
    </div>
  )
}

function DangerZone({ onDelete }: { onDelete: () => void }) {
  const [asking, setAsking] = useState(false)

  return (
    <section className="mt-9 px-5">
      {asking ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-surface p-3">
          <span className="min-w-0 flex-1 text-[15px]">Удалить пост со всем содержанием?</span>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="press rounded-btn bg-inset px-3.5 py-1.5 text-[14px] text-dim"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="press rounded-btn bg-red px-3.5 py-1.5 text-[14px] font-semibold text-white"
          >
            Удалить
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="press w-full rounded-btn bg-surface py-3 text-[15px] font-medium text-red-bright"
        >
          Удалить пост
        </button>
      )}
    </section>
  )
}
