import { requireSupabase } from '@/platform/supabase'
import type { Category, Course, CourseCover, Lesson, LessonBlock } from '@/modules/catalog'

/** Курс глазами админки: с флагом черновика и счётчиками. */
export interface AdminCourse extends Course {
  published: boolean
  sortOrder: number
}

export interface CourseDraft {
  slug: string
  title: string
  subtitle: string
  categoryId: string
  cover: CourseCover
  level: Course['level']
  badges: string[]
  author: string
  description: string
  published: boolean
}

const COURSE_FIELDS =
  'id, slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order, lessons_count, duration_min'

const FALLBACK_COVER: CourseCover = { from: '#3B9EFF', to: '#1E3A8A', pattern: 'grid' }

function fail(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toAdminCourse(row: any): AdminCourse {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? '',
    categoryId: row.category_id,
    cover: { ...FALLBACK_COVER, ...(row.cover ?? {}) },
    level: row.level,
    durationMin: row.duration_min ?? 0,
    lessonsCount: row.lessons_count ?? 0,
    badges: row.badges ?? [],
    author: row.author ?? '',
    description: row.description ?? '',
    published: row.published,
    sortOrder: row.sort_order ?? 0,
  }
}

function toLesson(row: any): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    order: row.position,
    title: row.title ?? '',
    durationMin: row.duration_min ?? 5,
    blocks: row.blocks ?? [],
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Операции админки. Права здесь не проверяются — это делает база:
 * при отсутствии строки в admins любой из этих вызовов вернёт ошибку RLS.
 * Интерфейс не должен быть единственным замком на двери.
 */
export const adminRepository = {
  /** Все курсы, включая черновики. */
  async listCourses(): Promise<AdminCourse[]> {
    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .order('sort_order')

    if (error) fail('Не удалось загрузить курсы', error)
    return (data ?? []).map(toAdminCourse)
  },

  async getCourse(id: string): Promise<AdminCourse | null> {
    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .eq('id', id)
      .maybeSingle()

    if (error) fail('Не удалось загрузить курс', error)
    return data ? toAdminCourse(data) : null
  },

  async createCourse(draft: CourseDraft): Promise<AdminCourse> {
    const { data, error } = await requireSupabase()
      .from('courses')
      .insert({
        slug: draft.slug,
        title: draft.title,
        subtitle: draft.subtitle,
        category_id: draft.categoryId,
        cover: draft.cover,
        level: draft.level,
        badges: draft.badges,
        author: draft.author,
        description: draft.description,
        published: draft.published,
      })
      .select(
        'id, slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order',
      )
      .single()

    if (error) fail('Не удалось создать курс', error)
    return toAdminCourse(data)
  },

  async updateCourse(id: string, patch: Partial<CourseDraft>): Promise<void> {
    const { error } = await requireSupabase()
      .from('courses')
      .update({
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.subtitle !== undefined && { subtitle: patch.subtitle }),
        ...(patch.categoryId !== undefined && { category_id: patch.categoryId }),
        ...(patch.cover !== undefined && { cover: patch.cover }),
        ...(patch.level !== undefined && { level: patch.level }),
        ...(patch.badges !== undefined && { badges: patch.badges }),
        ...(patch.author !== undefined && { author: patch.author }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.published !== undefined && { published: patch.published }),
      })
      .eq('id', id)

    if (error) fail('Не удалось сохранить курс', error)
  },

  async deleteCourse(id: string): Promise<void> {
    // Уроки удалятся сами: внешний ключ объявлен с on delete cascade.
    const { error } = await requireSupabase().from('courses').delete().eq('id', id)
    if (error) fail('Не удалось удалить курс', error)
  },

  async listLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await requireSupabase()
      .from('lessons')
      .select('id, course_id, position, title, duration_min, blocks')
      .eq('course_id', courseId)
      .order('position')

    if (error) fail('Не удалось загрузить уроки', error)
    return (data ?? []).map(toLesson)
  },

  async createLesson(courseId: string, position: number): Promise<Lesson> {
    const { data, error } = await requireSupabase()
      .from('lessons')
      .insert({ course_id: courseId, position, title: 'Новый урок', duration_min: 5, blocks: [] })
      .select('id, course_id, position, title, duration_min, blocks')
      .single()

    if (error) fail('Не удалось создать урок', error)
    return toLesson(data)
  },

  async updateLesson(
    id: string,
    patch: { title?: string; durationMin?: number; blocks?: LessonBlock[]; position?: number },
  ): Promise<void> {
    const { error } = await requireSupabase()
      .from('lessons')
      .update({
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.durationMin !== undefined && { duration_min: patch.durationMin }),
        ...(patch.blocks !== undefined && { blocks: patch.blocks }),
        ...(patch.position !== undefined && { position: patch.position }),
      })
      .eq('id', id)

    if (error) fail('Не удалось сохранить урок', error)
  },

  async deleteLesson(id: string): Promise<void> {
    const { error } = await requireSupabase().from('lessons').delete().eq('id', id)
    if (error) fail('Не удалось удалить урок', error)
  },

  async listCategories(): Promise<Category[]> {
    const { data, error } = await requireSupabase()
      .from('categories')
      .select('id, title, chip, accent, icon, description, sort_order')
      .order('sort_order')

    if (error) fail('Не удалось загрузить категории', error)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      chip: row.chip,
      accent: row.accent,
      icon: row.icon,
      description: row.description ?? '',
    }))
  },

  /** Загружает обложку в bucket covers и возвращает публичную ссылку. */
  async uploadCover(file: File): Promise<string> {
    const client = requireSupabase()
    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${crypto.randomUUID()}.${extension}`

    const { error } = await client.storage
      .from('covers')
      .upload(path, file, { cacheControl: '31536000', upsert: false })

    if (error) fail('Не удалось загрузить картинку', error)
    return client.storage.from('covers').getPublicUrl(path).data.publicUrl
  },
}
