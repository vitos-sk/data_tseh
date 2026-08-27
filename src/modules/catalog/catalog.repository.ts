import { isSupabaseConfigured } from '@/platform/supabase'
import { supabaseCatalog } from './catalog.supabase'
import type { CatalogRepository } from './catalog.port'

/**
 * Источник данных выбирается один раз на старте: есть ключи Supabase —
 * работаем с базой, нет — с моками из src/data.
 *
 * Подмена происходит только при отсутствии настроек, но не при ошибке
 * запроса: молча подсунуть старые данные вместо упавшей базы — значит
 * скрыть поломку и показать пользователю неправду.
 *
 * Моки подгружаются отдельным файлом и только когда до них дошло дело:
 * статическим импортом они уезжали в прод и весили там 59 КБ — больше,
 * чем весь остальной код каталога.
 */

let pending: Promise<CatalogRepository> | null = null

function mock(): Promise<CatalogRepository> {
  pending ??= import('./catalog.mock').then((m) => m.mockCatalog)
  return pending
}

/** Тот же контракт, но каждый вызов сначала дожидается загрузки моков. */
const lazyMockCatalog: CatalogRepository = {
  getCategories: () => mock().then((r) => r.getCategories()),
  getPosts: (categoryId) => mock().then((r) => r.getPosts(categoryId)),
  searchPosts: (query) => mock().then((r) => r.searchPosts(query)),
  getPostsByIds: (ids) => mock().then((r) => r.getPostsByIds(ids)),
  getPostById: (id) => mock().then((r) => r.getPostById(id)),
  getPost: (slug) => mock().then((r) => r.getPost(slug)),
  getNextPost: (categoryId, currentId) => mock().then((r) => r.getNextPost(categoryId, currentId)),
}

export const catalogRepository: CatalogRepository = isSupabaseConfigured()
  ? supabaseCatalog
  : lazyMockCatalog

export type { CatalogRepository }
