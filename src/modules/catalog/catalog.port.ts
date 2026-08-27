import type { Category, CategoryId, Post, PostDetail } from './catalog.types'

/**
 * Контракт доступа к каталогу. Реализаций две: моки в коде и Supabase.
 * Экраны знают только этот интерфейс, поэтому переключение источника
 * данных их не касается (docs/decisions/0002).
 *
 * Списочные методы отдают Post без содержания, getPost — PostDetail вместе
 * с блоками: тело поста нужно ровно в одном месте, и грузить его в каталоге
 * незачем.
 */
export interface CatalogRepository {
  getCategories(): Promise<Category[]>
  getPosts(categoryId?: CategoryId): Promise<Post[]>
  searchPosts(query: string): Promise<Post[]>
  getPostsByIds(ids: string[]): Promise<Post[]>
  getPostById(id: string): Promise<Post | null>
  getPost(slug: string): Promise<PostDetail | null>
  /**
   * Следующий пост того же направления — то, что предлагается в конце чтения.
   * Список закольцован: за последним идёт первый, иначе у половины
   * направлений конец поста оказывался бы тупиком.
   */
  getNextPost(categoryId: CategoryId, currentId: string): Promise<Post | null>
}
