import type { PostBlock } from './catalog.types'

/**
 * Слов в минуту. Ниже привычных 200: технический текст с примерами читают
 * медленнее художественного, и завышенная оценка на карточке обманывает.
 */
const WORDS_PER_MINUTE = 140

/** Секунд на одну строку кода: код читают медленнее прозы, но часто по диагонали. */
const SECONDS_PER_CODE_LINE = 4

/** Картинку разглядывают около шести секунд, команду — примерно столько же. */
const SECONDS_PER_IMAGE = 6
const SECONDS_PER_COMMAND = 6

function words(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length
}

function secondsOf(block: PostBlock): number {
  const read = (text: string) => (words(text) / WORDS_PER_MINUTE) * 60

  switch (block.type) {
    case 'heading':
    case 'text':
    case 'quote':
    case 'callout':
      return read(block.text)

    case 'list':
      return read(block.items.join(' '))

    case 'image':
      return SECONDS_PER_IMAGE + (block.caption ? read(block.caption) : 0)

    case 'code':
      return block.code.split('\n').length * SECONDS_PER_CODE_LINE

    case 'command':
      return SECONDS_PER_COMMAND + (block.note ? read(block.note) : 0)

    // Промт чаще копируют, чем вычитывают, поэтому считаем его как обычный текст,
    // а не как код: иначе длинная инструкция раздувает оценку вдвое.
    case 'prompt':
      return read(block.text)
  }
}

/**
 * Оценка времени чтения поста в минутах, не меньше одной.
 *
 * Значение хранится в базе рядом с постом: карточки каталога показывают время,
 * а тянуть содержимое всех постов ради одного числа — лишний трафик. Считается
 * при каждом сохранении, поэтому разъехаться с содержанием не может.
 */
export function estimateReadMin(blocks: PostBlock[]): number {
  const seconds = blocks.reduce((sum, block) => sum + secondsOf(block), 0)
  return Math.max(1, Math.round(seconds / 60))
}
