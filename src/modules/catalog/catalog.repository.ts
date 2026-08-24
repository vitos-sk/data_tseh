import { isSupabaseConfigured } from '@/platform/supabase'
import { mockCatalog } from './catalog.mock'
import { supabaseCatalog } from './catalog.supabase'
import type { CatalogRepository } from './catalog.port'

/**
 * Источник данных выбирается один раз на старте: есть ключи Supabase —
 * работаем с базой, нет — с моками из src/data.
 *
 * Подмена происходит только при отсутствии настроек, но не при ошибке
 * запроса: молча подсунуть старые данные вместо упавшей базы — значит
 * скрыть поломку и показать пользователю неправду.
 */
export const catalogRepository: CatalogRepository = isSupabaseConfigured()
  ? supabaseCatalog
  : mockCatalog

export type { CatalogRepository }
