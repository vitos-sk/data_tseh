import type { Post, PostDetail } from './catalog.types'

/**
 * Кэш прочитанных постов на устройстве.
 *
 * «Сохранить на потом» в мини-аппе значит «прочитать там, где нет сети»:
 * в метро, в самолёте, в лифте. Стор закладок хранит только идентификаторы,
 * поэтому без этого кэша экран «Закладки» офлайн показывал бы пустоту.
 *
 * Пишем сюда каждый открытый пост — это ровно тот набор, который человек
 * может захотеть перечитать. localStorage, а не CloudStorage: у последнего
 * лимит 4 КБ на значение, в который не влезет и один пост.
 */

const PREFIX = 'tseh:post:'
const INDEX_KEY = 'tseh:post-index'
/** Сколько постов держим. Дальше вытесняем самый давний по обращению. */
const MAX_ENTRIES = 30

function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeIndex(slugs: string[]): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(slugs))
  } catch {
    /* приватный режим или переполнение — кэш не критичен, молчим */
  }
}

/** Кладёт пост в кэш и поднимает его в начало очереди вытеснения. */
export function cachePost(post: PostDetail): void {
  try {
    localStorage.setItem(PREFIX + post.slug, JSON.stringify(post))
  } catch {
    // Квота кончилась: чистим половину очереди и на этом успокаиваемся —
    // повторная попытка на следующем открытии поста пройдёт.
    const stale = readIndex().slice(MAX_ENTRIES / 2)
    for (const slug of stale) forget(slug)
    return
  }

  const next = [post.slug, ...readIndex().filter((slug) => slug !== post.slug)]
  for (const slug of next.slice(MAX_ENTRIES)) forget(slug)
  writeIndex(next.slice(0, MAX_ENTRIES))
}

function forget(slug: string): void {
  try {
    localStorage.removeItem(PREFIX + slug)
  } catch {
    /* см. выше */
  }
}

/** Пост целиком из кэша — запасной путь, когда сеть не ответила. */
export function readCachedPost(slug: string): PostDetail | null {
  try {
    const raw = localStorage.getItem(PREFIX + slug)
    return raw ? (JSON.parse(raw) as PostDetail) : null
  } catch {
    return null
  }
}

/**
 * Краткие карточки закладок из кэша. Порядок задаёт список id: это порядок,
 * в котором пользователь их добавлял, и менять его база не вправе.
 */
export function readCachedPostsByIds(ids: string[]): Post[] {
  const byId = new Map<string, Post>()

  for (const slug of readIndex()) {
    const post = readCachedPost(slug)
    if (post) {
      const { blocks, ...brief } = post
      void blocks
      byId.set(post.id, brief)
    }
  }

  return ids.map((id) => byId.get(id)).filter((post): post is Post => Boolean(post))
}
