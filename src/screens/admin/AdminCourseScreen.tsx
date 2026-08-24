import { ArrowLeft, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CoverArt } from '@/components/course/CoverArt'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDuration } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminRepository, type CourseDraft } from '@/modules/admin/admin.repository'
import type { CourseCover, Lesson } from '@/modules/catalog'
import { adminPath } from './adminPath'
import { ChoiceRow, Field, Select, TextArea, TextInput, ToggleChips } from './AdminFields'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function AdminCourseScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const { data: course, loading } = useAsync(() => adminRepository.getCourse(id), [id])
  const { data: categories } = useAsync(() => adminRepository.listCategories(), [])
  const [lessonsKey, setLessonsKey] = useState(0)
  const { data: lessons } = useAsync(() => adminRepository.listLessons(id), [id, lessonsKey])

  const [draft, setDraft] = useState<CourseDraft | null>(null)
  const [state, setState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Форма наполняется один раз, когда курс приехал: дальше она живёт сама,
  // иначе каждое обновление данных стирало бы несохранённые правки.
  useEffect(() => {
    if (!course || draft) return
    setDraft({
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      categoryId: course.categoryId,
      cover: course.cover,
      level: course.level,
      badges: course.badges,
      author: course.author,
      description: course.description,
      published: course.published,
    })
  }, [course, draft])

  const patch = (values: Partial<CourseDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...values } : prev))
    setState('idle')
  }

  const save = async () => {
    if (!draft) return
    setState('saving')
    setError(null)
    try {
      await adminRepository.updateCourse(id, draft)
      setState('saved')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  const remove = async () => {
    try {
      await adminRepository.deleteCourse(id)
      navigate(adminPath())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  const addLesson = async () => {
    try {
      const position = (lessons?.length ?? 0) + 1
      const lesson = await adminRepository.createLesson(id, position)
      navigate(adminPath(`/course/${id}/lesson/${lesson.id}`))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать урок')
    }
  }

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
      <div className="mb-5 flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => navigate(adminPath())}
          aria-label="К списку курсов"
          className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-inset text-muted"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[20px] font-bold tracking-[-0.02em]">
          {draft.title || 'Без названия'}
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-5">
        <Field label="Название">
          <TextInput value={draft.title} onChange={(title) => patch({ title })} />
        </Field>

        <Field label="Подзаголовок" hint="Одна строка под названием на карточке">
          <TextInput value={draft.subtitle} onChange={(subtitle) => patch({ subtitle })} />
        </Field>

        <Field label="Адрес" hint="Часть ссылки: /course/адрес. Только латиница и дефисы">
          <TextInput
            value={draft.slug}
            onChange={(slug) => patch({ slug: slug.toLowerCase().replaceAll(/[^a-z0-9-]/g, '-') })}
          />
        </Field>

        <Field label="Направление">
          <Select
            value={draft.categoryId}
            onChange={(categoryId) => patch({ categoryId })}
            options={(categories ?? []).map((c) => ({ value: c.id, label: c.title }))}
          />
        </Field>

        <Field label="Уровень">
          <ChoiceRow
            value={draft.level}
            onChange={(level) => patch({ level })}
            options={[
              { value: 'beginner', label: 'С нуля' },
              { value: 'middle', label: 'Средний' },
              { value: 'any', label: 'Любой' },
            ]}
          />
        </Field>

        <Field label="Бейджи">
          <ToggleChips
            values={draft.badges}
            onChange={(badges) => patch({ badges })}
            options={[
              { value: 'new', label: 'Новое' },
              { value: 'free', label: 'Бесплатно' },
            ]}
          />
        </Field>

        <Field label="Автор">
          <TextInput value={draft.author} onChange={(author) => patch({ author })} />
        </Field>

        <Field label="Описание">
          <TextArea
            value={draft.description}
            onChange={(description) => patch({ description })}
            rows={5}
          />
        </Field>

        <CoverEditor cover={draft.cover} onChange={(cover) => patch({ cover })} />

        <Field label="Видимость">
          <ChoiceRow
            value={draft.published ? 'published' : 'draft'}
            onChange={(value) => patch({ published: value === 'published' })}
            options={[
              { value: 'draft', label: 'Черновик' },
              { value: 'published', label: 'Опубликован' },
            ]}
          />
        </Field>
      </div>

      {error && <p className="mt-4 px-5 text-[14px] leading-snug text-cat-orange">{error}</p>}

      <div className="mt-6 px-5">
        <button
          type="button"
          onClick={() => void save()}
          disabled={state === 'saving'}
          className="press w-full rounded-full bg-cta py-3.5 text-[16px] font-semibold text-bg disabled:opacity-40"
        >
          {state === 'saving' ? 'Сохраняем…' : state === 'saved' ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      <LessonList
        lessons={lessons ?? []}
        onOpen={(lessonId) => navigate(adminPath(`/course/${id}/lesson/${lessonId}`))}
        onAdd={() => void addLesson()}
        onDeleted={() => setLessonsKey((k) => k + 1)}
      />

      <DangerZone onDelete={() => void remove()} />
    </div>
  )
}

function CoverEditor({
  cover,
  onChange,
}: {
  cover: CourseCover
  onChange: (cover: CourseCover) => void
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
    <Field label="Обложка" hint="Без картинки рисуется градиент — он же виден, пока картинка грузится">
      <CoverArt cover={cover} className="mb-3 h-36 rounded-2xl" />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <label className="press flex-1 cursor-pointer rounded-full bg-inset py-2.5 text-center text-[15px] font-medium text-muted">
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
              className="press rounded-full bg-inset px-4 py-2.5 text-[15px] font-medium text-muted"
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

      {error && <span className="mt-2 block text-[13px] text-cat-orange">{error}</span>}
    </Field>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      className="size-11 shrink-0 cursor-pointer rounded-full border-none bg-transparent p-0"
      style={{ appearance: 'none' }}
    />
  )
}

function LessonList({
  lessons,
  onOpen,
  onAdd,
  onDeleted,
}: {
  lessons: Lesson[]
  onOpen: (id: string) => void
  onAdd: () => void
  onDeleted: () => void
}) {
  return (
    <section className="mt-9 px-5">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="text-[13px] font-semibold tracking-wide text-muted uppercase">Уроки</h2>
        <button
          type="button"
          onClick={onAdd}
          className="press flex items-center gap-1 text-[15px] font-medium text-gold"
        >
          <Plus size={16} strokeWidth={2.6} />
          Добавить
        </button>
      </div>

      {lessons.length === 0 ? (
        <p className="rounded-[var(--radius-card)] bg-surface p-4 text-[15px] text-muted">
          Уроков ещё нет. Курс без уроков публиковать бессмысленно.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface">
          <div className="divide-y divide-hairline">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-2 px-3 py-3">
                <GripVertical size={16} className="shrink-0 text-muted/50" />

                <button
                  type="button"
                  onClick={() => onOpen(lesson.id)}
                  className="press min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-[16px] font-medium">
                    {lesson.order}. {lesson.title || 'Без названия'}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted">
                    {formatDuration(lesson.durationMin)} · блоков: {lesson.blocks.length}
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Удалить урок"
                  onClick={async () => {
                    await adminRepository.deleteLesson(lesson.id)
                    onDeleted()
                  }}
                  className="press flex size-8 shrink-0 items-center justify-center rounded-full bg-inset text-muted"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function DangerZone({ onDelete }: { onDelete: () => void }) {
  const [asking, setAsking] = useState(false)

  return (
    <section className="mt-9 px-5">
      {asking ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-surface p-3">
          <span className="min-w-0 flex-1 text-[15px]">Удалить курс со всеми уроками?</span>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="press rounded-full bg-inset px-3.5 py-1.5 text-[14px] text-muted"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="press rounded-full bg-cat-orange px-3.5 py-1.5 text-[14px] font-semibold text-bg"
          >
            Удалить
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="press w-full rounded-full bg-surface py-3 text-[15px] font-medium text-cat-orange"
        >
          Удалить курс
        </button>
      )}
    </section>
  )
}
