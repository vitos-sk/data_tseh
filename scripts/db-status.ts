import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, { max: 1, prepare: false })

const [{ categories }] = await sql`select count(*)::int as categories from public.categories`
const [{ posts }] = await sql`select count(*)::int as posts from public.posts`
const [{ published }] =
  await sql`select count(*)::int as published from public.posts where published`
const [{ admins }] = await sql`select count(*)::int as admins from public.admins`

console.log(
  `категорий ${categories}, постов ${posts} (опубликовано ${published}), админов ${admins}`,
)

const rows = await sql`
  select title, read_min, jsonb_array_length(blocks) as blocks
  from public.posts order by sort_order limit 5
`
for (const r of rows) console.log(`  ${r.title}: ${r.blocks} блоков, ${r.read_min} мин`)

await sql.end()
