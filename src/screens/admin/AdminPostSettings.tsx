import { ChevronDown, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { CoverArt } from '@/components/post/CoverArt'
import { adminRepository, type PostDraft } from '@/modules/admin/admin.repository'
import type { Category, PostCover } from '@/modules/catalog'
import { ChoiceRow, Field, Select, TextInput, ToggleChips } from './AdminFields'

/**
 * Метаданные поста. Свёрнуты по умолчанию и лежат под содержанием: адрес и
 * бейджи задают один раз при создании, а текст правят каждый раз.
 */
export function AdminPostSettings({
  draft,
  categories,
  onPatch,
}: {
  draft: PostDraft
  categories: Category[]
  onPatch: (values: Partial<PostDraft>) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-8 px-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="press flex w-full items-center gap-2.5 rounded-[var(--radius-card)] bg-surface px-3.5 py-3 text-left"
        aria-expanded={open}
      >
        <Settings2 size={16} className="shrink-0 text-dim" />
        <span className="flex-1 text-[15px] font-semibold">Настройки поста</span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-dim transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-5">
          <Field label="Подзаголовок" hint="Одна строка под названием на карточке">
            <TextInput value={draft.subtitle} onChange={(subtitle) => onPatch({ subtitle })} />
          </Field>

          <Field label="Адрес" hint="Часть ссылки: /p/адрес. Только латиница и дефисы">
            <TextInput
              value={draft.slug}
              onChange={(slug) =>
                onPatch({ slug: slug.toLowerCase().replaceAll(/[^a-z0-9-]/g, '-') })
              }
            />
          </Field>

          <Field label="Направление">
            <Select
              value={draft.categoryId}
              onChange={(categoryId) => onPatch({ categoryId })}
              options={categories.map((c) => ({ value: c.id, label: c.title }))}
            />
          </Field>

          <Field label="Бейджи">
            <ToggleChips
              values={draft.badges}
              onChange={(badges) => onPatch({ badges })}
              options={[
                { value: 'new', label: 'Новое' },
                { value: 'free', label: 'Бесплатно' },
              ]}
            />
          </Field>

          <CoverEditor cover={draft.cover} onChange={(cover) => onPatch({ cover })} />

          <Field label="Видимость">
            <ChoiceRow
              value={draft.published ? 'published' : 'draft'}
              onChange={(value) => onPatch({ published: value === 'published' })}
              options={[
                { value: 'draft', label: 'Черновик' },
                { value: 'published', label: 'Опубликован' },
              ]}
            />
          </Field>
        </div>
      )}
    </section>
  )
}

function CoverEditor({
  cover,
  onChange,
}: {
  cover: PostCover
  onChange: (cover: PostCover) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const imageUrl = await adminRepository.uploadCover(file)
      onChange({ ...cover, imageUrl })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field
      label="Обложка"
      hint="Без картинки рисуется градиент — он же виден, пока картинка грузится"
    >
      <CoverArt cover={cover} className="mb-3 h-36 rounded-2xl" />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="press flex-1 cursor-pointer rounded-btn bg-inset py-2.5 text-center text-[15px] font-medium text-dim">
            {uploading ? 'Загружаем…' : 'Загрузить картинку'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void upload(file)
              }}
            />
          </label>

          {cover.imageUrl && (
            <button
              type="button"
              onClick={() => onChange({ ...cover, imageUrl: undefined })}
              className="press rounded-btn bg-inset px-4 py-2.5 text-[15px] font-medium text-dim"
            >
              Убрать
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <ColorInput value={cover.from} onChange={(from) => onChange({ ...cover, from })} />
          <ColorInput value={cover.to} onChange={(to) => onChange({ ...cover, to })} />
          <Select
            value={cover.pattern}
            onChange={(pattern) => onChange({ ...cover, pattern })}
            options={[
              { value: 'grid', label: 'Сетка' },
              { value: 'rings', label: 'Круги' },
              { value: 'waves', label: 'Волны' },
              { value: 'dots', label: 'Точки' },
            ]}
          />
        </div>
      </div>

      {error && <span className="mt-2 block text-[13px] text-red-bright">{error}</span>}
    </Field>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      className="size-11 shrink-0 cursor-pointer rounded-btn border-none bg-transparent p-0"
      style={{ appearance: 'none' }}
    />
  )
}
