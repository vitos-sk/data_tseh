import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CoverArt } from '@/components/course/CoverArt'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDuration, pluralLessons } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { adminRepository } from '@/modules/admin/admin.repository'
import { adminPath } from './adminPath'

export function AdminCoursesScreen() {
  const navigate = useNavigate()
  const [reloadKey, setReloadKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: courses, loading } = useAsync(() => adminRepository.listCourses(), [reloadKey])
  const { data: categories } = useAsync(() => adminRepository.listCategories(), [])

  const createCourse = async () => {
    if (!categories || categories.length === 0) {
      setError('Сначала нужна хотя бы одна категория')
      return
    }
    setCreating(true)
    setError(null)

    try {
      const course = await adminRepository.createCourse({
        slug: `novyy-kurs-${Date.now().toString(36)}`,
        title: 'Новый курс',
        subtitle: '',
        categoryId: categories[0].id,
        cover: { from: '#3B9EFF', to: '#1E3A8A', pattern: 'grid' },
        level: 'any',
        badges: [],
        author: '',
        description: '',
        published: false,
      })
      navigate(adminPath(`/course/${course.id}`))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не получилось')
      setReloadKey((k) => k + 1)
    } finally {
      setCreating(false)
    }
  }

  const drafts = courses?.filter((c) => !c.published) ?? []
  const published = courses?.filter((c) => c.published) ?? []

  return (
    <div className="pt-5">
      <div className="mb-5 flex items-center justify-between gap-3 px-5">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em]">Курсы</h1>
        <button
          type="button"
          disabled={creating}
          onClick={() => void createCourse()}
          className="press flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-[15px] font-semibold text-bg disabled:opacity-40"
        >
          <Plus size={17} strokeWidth={2.6} />
          Создать
        </button>
      </div>

      {error && (
        <p className="mb-4 px-5 text-[14px] leading-snug text-cat-orange">{error}</p>
      )}

      {loading && (
        <div className="flex flex-col gap-2.5 px-5">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {!loading && courses?.length === 0 && (
        <EmptyState
          icon={<FileText size={26} />}
          title="Курсов пока нет"
          text="Создайте первый — он появится в приложении, когда вы его опубликуете."
        />
      )}

      {!loading && drafts.length > 0 && (
        <Section title="Черновики" hint="Видны только вам">
          {drafts.map((course) => (
            <AdminCourseRow key={course.id} course={course} />
          ))}
        </Section>
      )}

      {!loading && published.length > 0 && (
        <Section title="Опубликованы">
          {published.map((course) => (
            <AdminCourseRow key={course.id} course={course} />
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
        <h2 className="text-[13px] font-semibold tracking-wide text-muted uppercase">{title}</h2>
        {hint && <span className="text-[12.5px] text-muted">· {hint}</span>}
      </div>
      <div className="flex flex-col gap-2.5 px-5">{children}</div>
    </section>
  )
}

function AdminCourseRow({
  course,
}: {
  course: import('@/modules/admin/admin.repository').AdminCourse
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(adminPath(`/course/${course.id}`))}
      className="press flex items-center gap-3.5 rounded-[var(--radius-card)] bg-surface p-3 text-left"
    >
      <CoverArt cover={course.cover} className="size-12 shrink-0 rounded-xl" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold">{course.title}</span>
        <span className="mt-0.5 block truncate text-[13px] text-muted">
          {pluralLessons(course.lessonsCount)} · {formatDuration(course.durationMin)}
        </span>
      </span>

      {!course.published && <Badge tone="neutral">Черновик</Badge>}
    </button>
  )
}
