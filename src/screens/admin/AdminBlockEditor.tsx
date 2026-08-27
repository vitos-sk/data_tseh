import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Heading,
  Image as ImageIcon,
  List,
  Quote,
  Sparkles,
  Terminal,
  Trash2,
  Type,
} from 'lucide-react'
import { useState } from 'react'
import { adminRepository } from '@/modules/admin/admin.repository'
import type { PostBlock, PostBlockKind } from '@/modules/catalog'
import { ChoiceRow, Select, TextArea, TextInput } from './AdminFields'

const BLOCK_META: Record<PostBlockKind, { label: string; Icon: typeof Type }> = {
  heading: { label: 'Заголовок', Icon: Heading },
  text: { label: 'Абзац', Icon: Type },
  list: { label: 'Список', Icon: List },
  code: { label: 'Код', Icon: Code2 },
  command: { label: 'Команда', Icon: Terminal },
  prompt: { label: 'Промт', Icon: Sparkles },
  callout: { label: 'Врезка', Icon: AlertCircle },
  quote: { label: 'Цитата', Icon: Quote },
  image: { label: 'Картинка', Icon: ImageIcon },
}

/*
 * Порядок в панели добавления — по частоте использования, а не по алфавиту:
 * текст и заголовок ставят в каждый пост, картинку — раз в десять постов.
 */
const BLOCK_ORDER: PostBlockKind[] = [
  'text',
  'heading',
  'list',
  'code',
  'command',
  'prompt',
  'callout',
  'quote',
  'image',
]

/** Пустая заготовка блока каждого вида. */
export function emptyBlock(kind: PostBlockKind): PostBlock {
  switch (kind) {
    case 'heading':
      return { type: 'heading', text: '' }
    case 'text':
      return { type: 'text', text: '' }
    case 'image':
      return { type: 'image', cover: { from: '#F04A1E', to: '#2A0E0A', pattern: 'grid' } }
    case 'list':
      return { type: 'list', items: [''] }
    case 'quote':
      return { type: 'quote', text: '' }
    case 'callout':
      return { type: 'callout', tone: 'info', text: '' }
    case 'code':
      return { type: 'code', lang: 'bash', code: '' }
    case 'command':
      return { type: 'command', command: '' }
    case 'prompt':
      return { type: 'prompt', text: '' }
  }
}

export function BlockCard({
  block,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  block: PostBlock
  index: number
  total: number
  onChange: (block: PostBlock) => void
  onMove: (delta: number) => void
  onDelete: () => void
}) {
  const { label, Icon } = BLOCK_META[block.type]

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon size={14} className="shrink-0 text-accent-bright" />
        <span className="flex-1 text-[12.5px] font-semibold tracking-wide text-dim uppercase">
          {label}
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
  block: PostBlock
  onChange: (block: PostBlock) => void
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
          <Select
            value={block.lang}
            onChange={(lang) => onChange({ ...block, lang })}
            options={[
              { value: 'bash', label: 'bash' },
              { value: 'ts', label: 'ts' },
              { value: 'tsx', label: 'tsx' },
              { value: 'js', label: 'js' },
              { value: 'json', label: 'json' },
              { value: 'sql', label: 'sql' },
              { value: 'python', label: 'python' },
              { value: 'text', label: 'без языка' },
            ]}
          />
          <TextArea
            value={block.code}
            onChange={(code) => onChange({ ...block, code })}
            placeholder="Код целиком — так, как его нужно скопировать"
            rows={6}
          />
        </div>
      )

    case 'command':
      return (
        <div className="flex flex-col gap-2">
          {/* Многострочное поле и для однострочной команды: длинные npx-строки
              не помещаются в input, а обрезанный хвост править вслепую нельзя. */}
          <TextArea
            value={block.command}
            onChange={(command) => onChange({ ...block, command })}
            placeholder="npx create-video@latest"
            rows={2}
          />
          <TextInput
            value={block.note ?? ''}
            onChange={(note) => onChange({ ...block, note: note || undefined })}
            placeholder="Что делает — можно не указывать"
          />
        </div>
      )

    case 'prompt':
      return (
        <div className="flex flex-col gap-2">
          <TextInput
            value={block.title ?? ''}
            onChange={(title) => onChange({ ...block, title: title || undefined })}
            placeholder="Название промта — можно не указывать"
          />
          <TextArea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Текст промта целиком"
            rows={6}
          />
          <span className="px-1 text-[12.5px] text-dim tabular-nums">
            {block.text.length} символов
          </span>
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
            className="press self-start text-[15px] font-medium text-accent-bright"
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

      {error && <span className="text-[13px] text-accent-bright">{error}</span>}
    </div>
  )
}

/**
 * Панель добавления: все девять видов сразу, кнопками с иконками.
 * Выпадающий список прятал редкие блоки за два действия — а промт и команду
 * ставят так же часто, как абзац.
 */
export function AddBlockPanel({ onAdd }: { onAdd: (kind: PostBlockKind) => void }) {
  return (
    <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-surface/50 p-3">
      <p className="mb-2.5 px-1 text-[12.5px] font-semibold tracking-wide text-dim uppercase">
        Добавить блок
      </p>

      <div className="grid grid-cols-3 gap-2">
        {BLOCK_ORDER.map((kind) => {
          const { label, Icon } = BLOCK_META[kind]
          const copyable = kind === 'code' || kind === 'command' || kind === 'prompt'

          return (
            <button
              key={kind}
              type="button"
              onClick={() => onAdd(kind)}
              className={`press flex flex-col items-center gap-1.5 rounded-btn border py-3 text-[13px] font-medium ${
                copyable
                  ? 'border-accent/26 bg-accent/[0.045] text-accent-bright'
                  : 'border-hairline bg-inset text-dim'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          )
        })}
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 px-1 text-[12.5px] text-dim">
        <Copy size={12} className="shrink-0" />
        подсвечены — блоки, которые читатель копирует одним нажатием
      </p>
    </div>
  )
}
