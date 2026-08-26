import { requireSupabase } from '@/platform/supabase'
import { estimateReadMin } from '@/modules/catalog'
import type { Category, PostBlock, PostCover, PostDetail } from '@/modules/catalog'

/** Пост глазами админки: с флагом черновика и позицией в каталоге. */
export interface AdminPost extends PostDetail {
  published: boolean
  sortOrder: number
}

/** Поля, которые правит редактор. Время чтения сюда не входит — оно считается. */
export interface PostDraft {
  slug: string
  title: string
  subtitle: string
  categoryId: string
  cover: PostCover
  blocks: PostBlock[]
  published: boolean
}

const POST_FIELDS =
  'id, slug, title, subtitle, category_id, cover, blocks, read_min, published, sort_order'

const FALLBACK_COVER: PostCover = { from: '#F04A1E', to: '#2A0E0A', pattern: 'grid' }

function fail(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toAdminPost(row: any): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? '',
    categoryId: row.category_id,
    cover: { ...FALLBACK_COVER, ...(row.cover ?? {}) },
    blocks: row.blocks ?? [],
    readMin: row.read_min ?? 1,
    published: row.published,
    sortOrder: row.sort_order ?? 0,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Операции админки. Права здесь не проверяются — это делает база:
 * при отсутствии строки в admins любой из этих вызовов вернёт ошибку RLS.
 * Интерфейс не должен быть единственным замком на двери.
 */
export const adminRepository = {
  /**
   * Все посты, включая черновики. Содержимое не тянем: список показывает
   * только заголовки, а блоки всех постов — это мегабайты.
   */
  async listPosts(): Promise<Omit<AdminPost, 'blocks'>[]> {
    const { data, error } = await requireSupabase()
      .from('posts')
      .select('id, slug, title, subtitle, category_id, cover, read_min, published, sort_order')
      .order('sort_order')

    if (error) fail('Не удалось загрузить посты', error)
    return (data ?? []).map(toAdminPost)
  },

  async getPost(id: string): Promise<AdminPost | null> {
    const { data, error } = await requireSupabase()
      .from('posts')
      .select(POST_FIELDS)
      .eq('id', id)
      .maybeSingle()

    if (error) fail('Не удалось загрузить пост', error)
    return data ? toAdminPost(data) : null
  },

  async createPost(categoryId: string): Promise<AdminPost> {
    const { data, error } = await requireSupabase()
      .from('posts')
      .insert({
        slug: `novyy-post-${Date.now().toString(36)}`,
        title: 'Новый пост',
        subtitle: '',
        category_id: categoryId,
        cover: FALLBACK_COVER,
        blocks: [],
        read_min: 1,
        published: false,
      })
      .select(POST_FIELDS)
      .single()

    if (error) fail('Не удалось создать пост', error)
    return toAdminPost(data)
  },

  /**
   * Сохранение поста. Время чтения пересчитывается здесь и только здесь —
   * единственная точка записи, поэтому разъехаться с содержанием оно не может.
   */
  async updatePost(id: string, patch: Partial<PostDraft>): Promise<number | null> {
    const readMin = patch.blocks ? estimateReadMin(patch.blocks) : null

    const { error } = await requireSupabase()
      .from('posts')
      .update({
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.subtitle !== undefined && { subtitle: patch.subtitle }),
        ...(patch.categoryId !== undefined && { category_id: patch.categoryId }),
        ...(patch.cover !== undefined && { cover: patch.cover }),
        ...(patch.blocks !== undefined && { blocks: patch.blocks }),
        ...(readMin !== null && { read_min: readMin }),
        ...(patch.published !== undefined && { published: patch.published }),
      })
      .eq('id', id)

    if (error) fail('Не удалось сохранить пост', error)
    return readMin
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await requireSupabase().from('posts').delete().eq('id', id)
    if (error) fail('Не удалось удалить пост', error)
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

  /** Загружает картинку в bucket covers и возвращает публичную ссылку. */
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
