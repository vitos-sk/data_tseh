import { CATEGORIES } from '@/data/categories'
import { COURSES } from '@/data/courses'
import { LESSONS_BY_COURSE } from '@/data/lessons'
import type { CatalogRepository } from './catalog.port'
import type { Category, CategoryId, Course, Lesson } from './catalog.types'

/**
 * Каталог из файлов в src/data. Работает без сети и без ключей —
 * на нём идёт разработка и на него приложение опирается, пока
 * Supabase не настроен.
 */

/** Небольшая задержка, чтобы состояния загрузки не мигали как артефакт. */
const LATENCY_MS = 120

function normalize(value: string): string {
  return value.toLowerCase().replaceAll('ё', 'е').trim()
}

function respond<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

export const mockCatalog: CatalogRepository = {
  getCategories(): Promise<Category[]> {
    return respond(CATEGORIES)
  },

  /** Все курсы; при указанной категории — только её. */
  getCourses(categoryId?: CategoryId): Promise<Course[]> {
    const list = categoryId ? COURSES.filter((c) => c.categoryId === categoryId) : COURSES
    return respond(list)
  },

  /**
   * Поиск по названию, подзаголовку, описанию и автору.
   * Регистр и буква «ё» не должны мешать: нормализуем и то, и другое.
   */
  searchCourses(query: string): Promise<Course[]> {
    const needle = normalize(query)
    if (!needle) return respond(COURSES)

    return respond(
      COURSES.filter((course) =>
        normalize(
          `${course.title} ${course.subtitle} ${course.description} ${course.author}`,
        ).includes(needle),
      ),
    )
  },

  getCoursesByIds(ids: string[]): Promise<Course[]> {
    const index = new Map(COURSES.map((c) => [c.id, c]))
    // Порядок сохраняем тот, в котором пришли id: это порядок добавления в закладки.
    return respond(ids.map((id) => index.get(id)).filter((c): c is Course => Boolean(c)))
  },

  getCourseById(id: string): Promise<Course | null> {
    return respond(COURSES.find((c) => c.id === id) ?? null)
  },

  getCourseBySlug(slug: string): Promise<Course | null> {
    return respond(COURSES.find((c) => c.slug === slug) ?? null)
  },

  getLessons(courseId: string): Promise<Lesson[]> {
    return respond(LESSONS_BY_COURSE[courseId] ?? [])
  },

  getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
    return respond(LESSONS_BY_COURSE[courseId]?.find((l) => l.id === lessonId) ?? null)
  },
}
