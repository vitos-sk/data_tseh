import type { Category, CategoryId, Course, Lesson } from './catalog.types'

/**
 * Контракт доступа к каталогу. Реализаций две: моки в коде и Supabase.
 * Экраны знают только этот интерфейс, поэтому переключение источника
 * данных их не касается (docs/decisions/0002).
 */
export interface CatalogRepository {
  getCategories(): Promise<Category[]>
  getCourses(categoryId?: CategoryId): Promise<Course[]>
  searchCourses(query: string): Promise<Course[]>
  getCoursesByIds(ids: string[]): Promise<Course[]>
  getCourseById(id: string): Promise<Course | null>
  getCourseBySlug(slug: string): Promise<Course | null>
  getLessons(courseId: string): Promise<Lesson[]>
  getLesson(courseId: string, lessonId: string): Promise<Lesson | null>
}
