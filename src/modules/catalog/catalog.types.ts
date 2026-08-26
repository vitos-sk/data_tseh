import type { AccentName } from '@/app/colors'

export type CategoryId = 'code' | 'ai' | 'business' | 'craft' | 'tips'

/** Название иконки lucide-react. Держим строкой, чтобы данные оставались данными. */
export type IconName = 'Code2' | 'Sparkles' | 'Briefcase' | 'Hammer' | 'Zap'

export interface Category {
  id: CategoryId
  /** Полное название для заголовков каталога */
  title: string
  /** Короткая подпись для чипа-фильтра */
  chip: string
  accent: AccentName
  icon: IconName
  description: string
}

/**
 * Обложка поста. Градиент есть всегда — он служит и самостоятельной
 * обложкой, и запасным вариантом, если картинка не загрузилась.
 */
export interface PostCover {
  from: string
  to: string
  pattern: 'rings' | 'grid' | 'waves' | 'dots'
  /** Загруженная в админку картинка. Если задана — показываем её поверх градиента. */
  imageUrl?: string
}

/**
 * Блок содержания. Новый вид добавляется одной веткой сюда и одной в
 * BlockRenderer — экран поста при этом не меняется (docs/decisions/0004).
 *
 * Три последних вида существуют ради копирования: код, команда терминала и
 * промт различаются не только оформлением, но и тем, что именно кладётся в
 * буфер обмена (docs/decisions/0011).
 */
export type PostBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'image'; cover: PostCover; caption?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'command'; command: string; note?: string }
  | { type: 'prompt'; text: string; title?: string }

export type PostBlockKind = PostBlock['type']

/**
 * Пост в списке: всё, что нужно карточке. Тела здесь нет намеренно —
 * иначе каталог тянул бы содержимое всех постов ради заголовков.
 */
export interface Post {
  id: string
  slug: string
  title: string
  subtitle: string
  categoryId: CategoryId
  cover: PostCover
  /** Время чтения в минутах. Считается из объёма текста при сохранении. */
  readMin: number
}

/** Пост вместе с содержанием — то, что открывается на экране. */
export interface PostDetail extends Post {
  blocks: PostBlock[]
}
