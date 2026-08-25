import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { adminRepository } from '@/modules/admin/admin.repository'
import type { LessonBlock } from '@/modules/catalog'
import { adminPath } from './adminPath'
import { ChoiceRow, Field, NumberInput, Select, TextArea, TextInput } from './AdminFields'

type BlockKind = LessonBlock['type']

const BLOCK_LABEL: Record<BlockKind, string> = {
  heading: 'Заголовок',
  text: 'Абзац',
  image: 'Картинка',
  list: 'Список',
  quote: 'Цитата',
  callout: 'Врезка',
  code: 'Код',
}

/** Пустая заготовка блока каждого вида. */
function emptyBlock(kind: BlockKind): LessonBlock {
  switch (kind) {
    case 'heading':
      return { type: 'heading', text: '' }
    case 'text':
      return { type: 'text', text: '' }
    case 'image':
      return { type: 'image', cover: { from: '#3B9EFF', to: '#1E3A8A', pattern: 'grid' } }
    case 'list':
      return { type: 'list', items: [''] }
    case 'quote':
      return { type: 'quote', text: '' }
    case 'callout':
      return { type: 'callout', tone: 'info', text: '' }
    case 'code':
      return { type: 'code', lang: 'text', code: '' }
  }
}

export function AdminLessonScreen() {
  const { id = '', lessonId = '' } = useParams()
  const navigate = useNavigate()

  const { data: lessons, loading } = useAsync(() => adminRepository.listLessons(id), [id])
  const lesson = lessons?.find((l) => l.id === lessonId) ?? null

  const [title, setTitle] = useState('')
  const [durationMin, setDurationMin] = useState(5)
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lesson || ready) return
    setTitle(lesson.title)
    setDurationMin(lesson.durationMin)
    setBlocks(lesson.blocks)
    setReady(true)
  }, [lesson, ready])

  const save = async () => {
    setState('saving')
    setError(null)
    try {
      await adminRepository.updateLesson(lessonId, { title, durationMin, blocks })
      setState('saved')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  const replaceBlock = (index: number, block: LessonBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)))
    setState('idle')
  }

  const moveBlock = (index: number, delta: number) => {
    setBlocks((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setState('idle')
  }

  if (loading || !ready) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-5 flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => navigate(adminPath(`/course/${id}`))}
          aria-label="К курсу"
          className="press flex size-9 shrink-0 items-center justify-center rounded-btn bg-inset text-dim"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-[0.1em] lowercase">
          {title || 'Без названия'}
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-5">
        <Field label="Название урока">
          <TextInput value={title} onChange={setTitle} />
        </Field>

        <Field label="Время чтения, минут" hint="Из этих минут складывается длительность курса">
          <NumberInput value={durationMin} onChange={setDurationMin} />
        </Field>
      </div>

      <section className="mt-8 px-5">
        <h2 className="mb-2.5 px-1 text-[13px] font-semibold tracking-wide text-dim uppercase">
          Содержание
        </h2>

        <div className="flex flex-col gap-3">
          {blocks.map((block, index) => (
            <BlockCard
              key={index}
              block={block}
              index={index}
              total={blocks.length}
              onChange={(next) => replaceBlock(index, next)}
              onMove={(delta) => moveBlock(index, delta)}
              onDelete={() => setBlocks((prev) => prev.filter((_, i) => i !== index))}
            />
          ))}
        </div>

        <AddBlock onAdd={(kind) => setBlocks((prev) => [...prev, emptyBlock(kind)])} />
      </section>

      {error && <p className="mt-4 px-5 text-[14px] leading-snug text-red-bright">{error}</p>}

      <div className="mt-7 px-5">
        <button
          type="button"
          onClick={() => void save()}
          disabled={state === 'saving'}
          className="press w-full rounded-btn bg-red py-3.5 text-[16px] font-semibold text-white disabled:opacity-40"
        >
          {state === 'saving' ? 'Сохраняем…' : state === 'saved' ? 'Сохранено' : 'Сохранить урок'}
        </button>
      </div>
    </div>
  )
}

function BlockCard({
  block,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  block: LessonBlock
  index: number
  total: number
  onChange: (block: LessonBlock) => void
  onMove: (delta: number) => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="flex-1 px-1 text-[12.5px] font-semibold tracking-wide text-dim uppercase">
          {BLOCK_LABEL[block.type]}
        </span>

        <IconAction label="Выше" disabled={index === 0} onClick={() => onMove(-1)}>
          <ChevronUp size={16} />
        </IconAction>
        <IconAction label="Ниже" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ChevronDown size={16} />
        </IconAction>
        <IconAction label="Удалить блок" onClick={onDelete}>
          <Trash2 size={15} />
        </IconAction>
      </div>

      <BlockEditor block={block} onChange={onChange} />
    </div>
  )
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="press flex size-8 shrink-0 items-center justify-center rounded-btn bg-inset text-dim disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function BlockEditor({
  block,
  onChange,
}: {
  block: LessonBlock
  onChange: (block: LessonBlock) => void
}) {
  switch (block.type) {
    case 'heading':
      return (
        <TextInput
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Текст заголовка"
        />
      )

    case 'text':
      return (
        <TextArea
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Абзац текста"
          rows={4}
        />
      )

    case 'quote':
      return (
        <div className="flex flex-col gap-2">
          <TextArea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Текст цитаты"
            rows={3}
          />
          <TextInput
            value={block.author ?? ''}
            onChange={(author) => onChange({ ...block, author: author || undefined })}
            placeholder="Автор — можно не указывать"
          />
        </div>
      )

    case 'callout':
      return (
        <div className="flex flex-col gap-2.5">
          <ChoiceRow
            value={block.tone}
            onChange={(tone) => onChange({ ...block, tone })}
            options={[
              { value: 'info', label: 'Заметка' },
              { value: 'warning', label: 'Осторожно' },
              { value: 'success', label: 'Хорошо' },
            ]}
          />
          <TextArea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Текст врезки"
            rows={3}
          />
        </div>
      )

    case 'code':
      return (
        <div className="flex flex-col gap-2">
          <TextInput
            value={block.lang}
            onChange={(lang) => onChange({ ...block, lang })}
            placeholder="Язык: bash, ts, text"
          />
          <TextArea
            value={block.code}
            onChange={(code) => onChange({ ...block, code })}
            placeholder="Код"
            rows={5}
          />
        </div>
      )

    case 'list':
      return (
        <div className="flex flex-col gap-2.5">
          <ChoiceRow
            value={block.ordered ? 'ordered' : 'plain'}
            onChange={(value) => onChange({ ...block, ordered: value === 'ordered' })}
            options={[
              { value: 'plain', label: 'Точками' },
              { value: 'ordered', label: 'Номерами' },
            ]}
          />

          {block.items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <TextInput
                value={item}
                onChange={(text) =>
                  onChange({ ...block, items: block.items.map((v, j) => (j === i ? text : v)) })
                }
                placeholder={`Пункт ${i + 1}`}
              />
              <IconAction
                label="Убрать пункт"
                onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
              >
                <Trash2 size={15} />
              </IconAction>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange({ ...block, items: [...block.items, ''] })}
            className="press self-start text-[15px] font-medium text-red-bright"
          >
            + пункт
          </button>
        </div>
      )

    case 'image':
      return (
        <div className="flex flex-col gap-2.5">
          <ImageBlockUpload
            url={block.cover.imageUrl}
            onChange={(imageUrl) => onChange({ ...block, cover: { ...block.cover, imageUrl } })}
          />
          <TextInput
            value={block.caption ?? ''}
            onChange={(caption) => onChange({ ...block, caption: caption || undefined })}
            placeholder="Подпись — можно не указывать"
          />
        </div>
      )
  }
}

function ImageBlockUpload({
  url,
  onChange,
}: {
  url?: string
  onChange: (url: string | undefined) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {url && <img src={url} alt="" className="h-32 w-full rounded-xl object-cover" />}

      <div className="flex gap-2">
        <label className="press flex-1 cursor-pointer rounded-btn bg-inset py-2.5 text-center text-[15px] font-medium text-dim">
          {uploading ? 'Загружаем…' : url ? 'Заменить' : 'Загрузить картинку'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setUploading(true)
              setError(null)
              try {
                onChange(await adminRepository.uploadCover(file))
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Не удалось загрузить')
              } finally {
                setUploading(false)
              }
            }}
          />
        </label>

        {url && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="press rounded-btn bg-inset px-4 py-2.5 text-[15px] font-medium text-dim"
          >
            Убрать
          </button>
        )}
      </div>

      {error && <span className="text-[13px] text-red-bright">{error}</span>}
    </div>
  )
}

function AddBlock({ onAdd }: { onAdd: (kind: BlockKind) => void }) {
  const [kind, setKind] = useState<BlockKind>('text')

  return (
    <div className="mt-3 flex gap-2">
      <Select
        value={kind}
        onChange={setKind}
        options={(Object.keys(BLOCK_LABEL) as BlockKind[]).map((value) => ({
          value,
          label: BLOCK_LABEL[value],
        }))}
      />
      <button
        type="button"
        onClick={() => onAdd(kind)}
        className="press flex shrink-0 items-center gap-1.5 rounded-btn bg-inset px-4 text-[15px] font-medium text-red-bright"
      >
        <Plus size={17} strokeWidth={2.6} />
        Блок
      </button>
    </div>
  )
}
