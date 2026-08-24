/**
 * Превращает моковый каталог в SQL для Supabase.
 * Запуск: npm run seed:sql — результат кладётся в supabase/seed.sql,
 * его нужно выполнить в SQL Editor проекта.
 *
 * Скрипт идемпотентен: повторный прогон обновит существующие строки
 * по slug и не наплодит дублей.
 */
import { writeFileSync } from 'node:fs'
import { CATEGORIES } from '../src/data/categories'
import { COURSES } from '../src/data/courses'
import { LESSONS_BY_COURSE } from '../src/data/lessons'

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
  '-- ── категории ──',
]

CATEGORIES.forEach((category, index) => {
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

lines.push('-- ── курсы и уроки ──')

COURSES.forEach((course, index) => {
  const lessons = LESSONS_BY_COURSE[course.id] ?? []

  lines.push(
    `insert into public.courses (slug, title, subtitle, category_id, cover, level, badges, author, description, published, sort_order) values (`,
    `  ${q(course.slug)}, ${q(course.title)}, ${q(course.subtitle)}, ${q(course.categoryId)},`,
    `  ${json(course.cover)}, ${q(course.level)}, ${arr(course.badges)},`,
    `  ${q(course.author)}, ${q(course.description)}, true, ${index}`,
    `) on conflict (slug) do update set`,
    `  title = excluded.title, subtitle = excluded.subtitle, category_id = excluded.category_id,`,
    `  cover = excluded.cover, level = excluded.level, badges = excluded.badges,`,
    `  author = excluded.author, description = excluded.description, sort_order = excluded.sort_order;`,
    '',
  )

  if (lessons.length === 0) return

  // Уроки пересоздаём целиком: сопоставлять их по позиции при изменившемся
  // составе сложнее, чем удалить и вставить заново.
  lines.push(
    `delete from public.lessons where course_id = (select id from public.courses where slug = ${q(course.slug)});`,
    `insert into public.lessons (course_id, position, title, duration_min, blocks)`,
    `select c.id, v.position, v.title, v.duration_min, v.blocks from public.courses c,`,
    `(values`,
  )

  const values = lessons.map(
    (lesson) =>
      `  (${lesson.order}, ${q(lesson.title)}, ${lesson.durationMin}, ${json(lesson.blocks)})`,
  )
  lines.push(values.join(',\n'))

  lines.push(
    `) as v(position, title, duration_min, blocks)`,
    `where c.slug = ${q(course.slug)};`,
    '',
  )
})

lines.push('commit;', '')

writeFileSync('supabase/seed.sql', lines.join('\n'), 'utf8')
console.log(
  `supabase/seed.sql готов: категорий ${CATEGORIES.length}, курсов ${COURSES.length}, ` +
    `уроков ${Object.values(LESSONS_BY_COURSE).reduce((sum, l) => sum + l.length, 0)}`,
)
