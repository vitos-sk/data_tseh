import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, { max: 1, prepare: false })

const [{ categories }] = await sql`select count(*)::int as categories from public.categories`
const [{ courses }] = await sql`select count(*)::int as courses from public.courses`
const [{ published }] =
  await sql`select count(*)::int as published from public.courses where published`
const [{ lessons }] = await sql`select count(*)::int as lessons from public.lessons`
const [{ admins }] = await sql`select count(*)::int as admins from public.admins`

console.log(
  `категорий ${categories}, курсов ${courses} (опубликовано ${published}), уроков ${lessons}, админов ${admins}`,
)

const rows = await sql`
  select title, lessons_count, duration_min from public.course_with_stats order by sort_order limit 3
`
for (const r of rows) console.log(`  ${r.title}: ${r.lessons_count} уроков, ${r.duration_min} мин`)

await sql.end()
