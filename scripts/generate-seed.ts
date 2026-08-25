/**
 * Превращает моковый каталог в SQL для Supabase.
 * Запуск: npm run seed:sql — результат кладётся в supabase/seed.sql,
 * его нужно выполнить в SQL Editor проекта или через npm run db:apply.
 *
 * Скрипт идемпотентен: повторный прогон обновит существующие строки
 * по slug и не наплодит дублей.
 *
 * Один пост: npm run seed:sql -- --only <slug>. Тогда файл называется
 * supabase/seed-<slug>.sql и трогает только этот пост. Это нужно потому,
 * что база живёт своей жизнью: часть каталога правят через админку, и
 * заливать поверх неё все моки разом — значит затереть чужую работу.
 */
import { writeFileSync } from 'node:fs'
import { CATEGORIES } from '../src/data/categories'
import { POSTS } from '../src/data/posts'
import { estimateReadMin } from '../src/modules/catalog/readTime'

const onlyIndex = process.argv.indexOf('--only')
const onlySlug = onlyIndex === -1 ? null : process.argv[onlyIndex + 1]

if (onlyIndex !== -1 && !onlySlug) {
  console.error('После --only нужен slug поста: npm run seed:sql -- --only remotion-video-kodom')
  process.exit(1)
}

// sort_order считаем по полному списку — иначе выгрузка одного поста
// сдвинула бы его в начало каталога.
const selected = onlySlug ? POSTS.filter((p) => p.slug === onlySlug) : POSTS

if (selected.length === 0) {
  console.error(`Поста со slug «${onlySlug}» нет в src/data/posts.ts`)
  process.exit(1)
}

const q = (value: string) => `'${value.replaceAll("'", "''")}'`
const json = (value: unknown) => `${q(JSON.stringify(value))}::jsonb`
const arr = (values: string[]) =>
  values.length === 0 ? `'{}'` : `array[${values.map(q).join(', ')}]`

const lines: string[] = [
  '-- Начальные данные каталога. Сгенерировано scripts/generate-seed.ts —',
  '-- править этот файл руками бессмысленно, он перезаписывается.',
  '',
  'begin;',
  '',
]

// Категории — часть общего каркаса, при выгрузке одного поста они уже есть в базе.
if (!onlySlug) lines.push('-- ── категории ──')

;(onlySlug ? [] : CATEGORIES).forEach((category, index) => {
  lines.push(
    `insert into public.categories (id, title, chip, accent, icon, description, sort_order) values (`,
    `  ${q(category.id)}, ${q(category.title)}, ${q(category.chip)}, ${q(category.accent)},`,
    `  ${q(category.icon)}, ${q(category.description)}, ${index}`,
    `) on conflict (id) do update set`,
    `  title = excluded.title, chip = excluded.chip, accent = excluded.accent,`,
    `  icon = excluded.icon, description = excluded.description, sort_order = excluded.sort_order;`,
    '',
  )
})

lines.push('-- ── посты ──')

selected.forEach((post) => {
  const index = POSTS.indexOf(post)
  // Время чтения считаем здесь же, а не берём из мока: в файле оно могло
  // остаться от прошлой редакции блоков.
  const readMin = estimateReadMin(post.blocks)

  lines.push(
    `insert into public.posts (slug, title, subtitle, category_id, cover, badges, blocks, read_min, published, sort_order) values (`,
    `  ${q(post.slug)}, ${q(post.title)}, ${q(post.subtitle)}, ${q(post.categoryId)},`,
    `  ${json(post.cover)}, ${arr(post.badges)}, ${json(post.blocks)}, ${readMin}, true, ${index}`,
    `) on conflict (slug) do update set`,
    `  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,`,
    `  cover = excluded.cover, badges = excluded.badges, blocks = excluded.blocks,`,
    `  read_min = excluded.read_min, sort_order = excluded.sort_order;`,
    '',
  )
})

lines.push('commit;', '')

const target = onlySlug ? `supabase/seed-${onlySlug}.sql` : 'supabase/seed.sql'
const blocksCount = selected.reduce((sum, post) => sum + post.blocks.length, 0)

writeFileSync(target, lines.join('\n'), 'utf8')
console.log(
  `${target} готов: категорий ${onlySlug ? 0 : CATEGORIES.length}, ` +
    `постов ${selected.length}, блоков ${blocksCount}`,
)
