import { requireSupabase } from '@/platform/supabase'
import type { CatalogRepository } from './catalog.port'
import type {
  Category,
  CategoryId,
  IconName,
  Post,
  PostBlock,
  PostCover,
  PostDetail,
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

interface PostRow {
  id: string
  slug: string
  title: string
  subtitle: string
  category_id: string
  cover: Partial<PostCover> | null
  read_min: number
  published: boolean
  sort_order: number
}

interface PostDetailRow extends PostRow {
  blocks: PostBlock[] | null
}

/* — перевод в доменные типы — */

const FALLBACK_COVER: PostCover = { from: '#F04A1E', to: '#2A0E0A', pattern: 'grid' }

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

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    categoryId: row.category_id as CategoryId,
    // Значения из jsonb приходят как есть, поэтому подстраховываемся:
    // пост с испорченной обложкой должен рисоваться, а не ронять экран.
    cover: { ...FALLBACK_COVER, ...(row.cover ?? {}) } as PostCover,
    readMin: row.read_min,
  }
}

function toPostDetail(row: PostDetailRow): PostDetail {
  return { ...toPost(row), blocks: row.blocks ?? [] }
}

/** Поля перечислены явно: `select('*')` ломается при добавлении колонок. */
const POST_FIELDS =
  'id, slug, title, subtitle, category_id, cover, read_min, published, sort_order'

/** Содержимое тянем только при открытии поста — в списках оно не нужно. */
const POST_DETAIL_FIELDS = `${POST_FIELDS}, blocks`

function fail(context: string, error: { message: string }): never {
  throw new Error(`Supabase: ${context} — ${error.message}`)
}

/**
 * Каталог из базы. Черновики сюда не попадают: их отсекает RLS,
 * поэтому фильтровать по published в запросах не нужно — но мы всё равно
 * делаем это явно, чтобы админский вход не подмешал незаконченные посты
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

  async getPosts(categoryId?: CategoryId) {
    let query = requireSupabase()
      .from('posts')
      .select(POST_FIELDS)
      .eq('published', true)
      .order('sort_order')
      .order('created_at', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) fail('посты', error)
    return (data as PostRow[]).map(toPost)
  },

  async searchPosts(query: string) {
    const needle = query.trim()
    if (!needle) return this.getPosts()

    // or() требует экранирования запятых и скобок — они ломают синтаксис фильтра
    const safe = needle.replaceAll(/[,()]/g, ' ')
    const { data, error } = await requireSupabase()
      .from('posts')
      .select(POST_FIELDS)
      .eq('published', true)
      .or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%`)
      .order('sort_order')

    if (error) fail('поиск', error)
    return (data as PostRow[]).map(toPost)
  },

  async getPostsByIds(ids: string[]) {
    if (ids.length === 0) return []

    const { data, error } = await requireSupabase().from('posts').select(POST_FIELDS).in('id', ids)

    if (error) fail('посты по списку', error)

    // Порядок закладок задаёт пользователь, а база возвращает свой —
    // восстанавливаем исходный.
    const byId = new Map((data as PostRow[]).map((row) => [row.id, toPost(row)]))
    return ids.map((id) => byId.get(id)).filter((post): post is Post => Boolean(post))
  },

  async getPostById(id: string) {
    const { data, error } = await requireSupabase()
      .from('posts')
      .select(POST_FIELDS)
      .eq('id', id)
      .maybeSingle()

    if (error) fail('пост', error)
    return data ? toPost(data as PostRow) : null
  },

  async getPost(slug: string) {
    const { data, error } = await requireSupabase()
      .from('posts')
      .select(POST_DETAIL_FIELDS)
      .eq('slug', slug)
      .maybeSingle()

    if (error) fail('пост по адресу', error)
    return data ? toPostDetail(data as PostDetailRow) : null
  },

  async getNextPost(categoryId: CategoryId, currentId: string) {
    // Забираем направление целиком: постов в нём единицы, а сдвиг на один
    // элемент в SQL потребовал бы знать sort_order текущего поста заранее.
    const list = await this.getPosts(categoryId)
    const index = list.findIndex((post) => post.id === currentId)
    if (index === -1 || list.length < 2) return null
    return list[(index + 1) % list.length]
  },
}
