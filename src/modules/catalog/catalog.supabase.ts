import { requireSupabase } from '@/platform/supabase'
import type { CatalogRepository } from './catalog.port'
import type {
  Category,
  CategoryId,
  Course,
  CourseBadge,
  CourseCover,
  CourseLevel,
  IconName,
  Lesson,
  LessonBlock,
} from './catalog.types'

/* — как выглядят строки в базе — */

interface CategoryRow {
  id: string
  title: string
  chip: string
  accent: string
  icon: string
  description: string
  sort_order: number
}

interface CourseRow {
  id: string
  slug: string
  title: string
  subtitle: string
  category_id: string
  cover: Partial<CourseCover> | null
  level: string
  badges: string[] | null
  author: string
  description: string
  published: boolean
  sort_order: number
  lessons_count: number
  duration_min: number
}

interface LessonRow {
  id: string
  course_id: string
  position: number
  title: string
  duration_min: number
  blocks: LessonBlock[] | null
}

/* — перевод в доменные типы — */

const FALLBACK_COVER: CourseCover = { from: '#3B9EFF', to: '#1E3A8A', pattern: 'grid' }

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id as CategoryId,
    title: row.title,
    chip: row.chip,
    accent: row.accent as Category['accent'],
    icon: row.icon as IconName,
    description: row.description,
  }
}

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    categoryId: row.category_id as CategoryId,
    // Значения из jsonb приходят как есть, поэтому подстраховываемся:
    // курс с испорченной обложкой должен рисоваться, а не ронять экран.
    cover: { ...FALLBACK_COVER, ...(row.cover ?? {}) } as CourseCover,
    level: row.level as CourseLevel,
    durationMin: row.duration_min,
    lessonsCount: row.lessons_count,
    badges: (row.badges ?? []) as CourseBadge[],
    author: row.author,
    description: row.description,
  }
}

function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    order: row.position,
    title: row.title,
    durationMin: row.duration_min,
    blocks: row.blocks ?? [],
  }
}

/** Поля представления перечислены явно: `select('*')` ломается при добавлении колонок. */
const COURSE_FIELDS =
  'id, slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order, lessons_count, duration_min'

function fail(context: string, error: { message: string }): never {
  throw new Error(`Supabase: ${context} — ${error.message}`)
}

/**
 * Каталог из базы. Черновики сюда не попадают: их отсекает RLS,
 * поэтому фильтровать по published в запросах не нужно — но мы всё равно
 * делаем это явно, чтобы админский вход не подмешал незаконченные курсы
 * в публичные экраны.
 */
export const supabaseCatalog: CatalogRepository = {
  async getCategories() {
    const { data, error } = await requireSupabase()
      .from('categories')
      .select('id, title, chip, accent, icon, description, sort_order')
      .order('sort_order')

    if (error) fail('категории', error)
    return (data as CategoryRow[]).map(toCategory)
  },

  async getCourses(categoryId?: CategoryId) {
    let query = requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .eq('published', true)
      .order('sort_order')
      .order('created_at', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) fail('курсы', error)
    return (data as CourseRow[]).map(toCourse)
  },

  async searchCourses(query: string) {
    const needle = query.trim()
    if (!needle) return this.getCourses()

    // or() требует экранирования запятых и скобок — они ломают синтаксис фильтра
    const safe = needle.replaceAll(/[,()]/g, ' ')
    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .eq('published', true)
      .or(
        `title.ilike.%${safe}%,subtitle.ilike.%${safe}%,description.ilike.%${safe}%,author.ilike.%${safe}%`,
      )
      .order('sort_order')

    if (error) fail('поиск', error)
    return (data as CourseRow[]).map(toCourse)
  },

  async getCoursesByIds(ids: string[]) {
    if (ids.length === 0) return []

    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .in('id', ids)

    if (error) fail('курсы по списку', error)

    // Порядок закладок задаёт пользователь, а база возвращает свой —
    // восстанавливаем исходный.
    const byId = new Map((data as CourseRow[]).map((row) => [row.id, toCourse(row)]))
    return ids.map((id) => byId.get(id)).filter((course): course is Course => Boolean(course))
  },

  async getCourseById(id: string) {
    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .eq('id', id)
      .maybeSingle()

    if (error) fail('курс', error)
    return data ? toCourse(data as CourseRow) : null
  },

  async getCourseBySlug(slug: string) {
    const { data, error } = await requireSupabase()
      .from('course_with_stats')
      .select(COURSE_FIELDS)
      .eq('slug', slug)
      .maybeSingle()

    if (error) fail('курс по адресу', error)
    return data ? toCourse(data as CourseRow) : null
  },

  async getLessons(courseId: string) {
    const { data, error } = await requireSupabase()
      .from('lessons')
      .select('id, course_id, position, title, duration_min, blocks')
      .eq('course_id', courseId)
      .order('position')

    if (error) fail('уроки', error)
    return (data as LessonRow[]).map(toLesson)
  },

  async getLesson(courseId: string, lessonId: string) {
    const { data, error } = await requireSupabase()
      .from('lessons')
      .select('id, course_id, position, title, duration_min, blocks')
      .eq('course_id', courseId)
      .eq('id', lessonId)
      .maybeSingle()

    if (error) fail('урок', error)
    return data ? toLesson(data as LessonRow) : null
  },
}
