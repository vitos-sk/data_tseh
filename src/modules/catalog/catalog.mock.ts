import { CATEGORIES } from '@/data/categories'
import { POSTS } from '@/data/posts'
import type { CatalogRepository } from './catalog.port'
import type { Category, CategoryId, Post, PostDetail } from './catalog.types'

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

/** Списочные методы отдают пост без содержания — ровно как это делает база. */
function brief({ blocks, ...post }: PostDetail): Post {
  void blocks
  return post
}

export const mockCatalog: CatalogRepository = {
  getCategories(): Promise<Category[]> {
    return respond(CATEGORIES)
  },

  /** Все посты; при указанной категории — только её. */
  getPosts(categoryId?: CategoryId): Promise<Post[]> {
    const list = categoryId ? POSTS.filter((p) => p.categoryId === categoryId) : POSTS
    return respond(list.map(brief))
  },

  /**
   * Поиск по названию и подзаголовку.
   * Регистр и буква «ё» не должны мешать: нормализуем и то, и другое.
   */
  searchPosts(query: string): Promise<Post[]> {
    const needle = normalize(query)
    if (!needle) return respond(POSTS.map(brief))

    return respond(
      POSTS.filter((post) => normalize(`${post.title} ${post.subtitle}`).includes(needle)).map(
        brief,
      ),
    )
  },

  getPostsByIds(ids: string[]): Promise<Post[]> {
    const index = new Map(POSTS.map((p) => [p.id, p]))
    // Порядок сохраняем тот, в котором пришли id: это порядок добавления в закладки.
    return respond(
      ids
        .map((id) => index.get(id))
        .filter((p): p is PostDetail => Boolean(p))
        .map(brief),
    )
  },

  getPostById(id: string): Promise<Post | null> {
    const post = POSTS.find((p) => p.id === id)
    return respond(post ? brief(post) : null)
  },

  getPost(slug: string): Promise<PostDetail | null> {
    return respond(POSTS.find((p) => p.slug === slug) ?? null)
  },

  getNextPost(categoryId: CategoryId, currentId: string): Promise<Post | null> {
    const list = POSTS.filter((p) => p.categoryId === categoryId)
    const index = list.findIndex((p) => p.id === currentId)
    if (index === -1 || list.length < 2) return respond(null)
    return respond(brief(list[(index + 1) % list.length]))
  },
}
