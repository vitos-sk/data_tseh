/**
 * Делает пользователя администратором каталога.
 * Запуск: npm run db:admin -- почта@пример.ру
 *
 * Создаёт пользователя, если его ещё нет, и добавляет строку в admins —
 * именно она открывает право на запись, всё остальное решает RLS.
 * Пароль не задаётся: вход только по ссылке на почту.
 */
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const email = process.argv[2]
if (!email?.includes('@')) {
  console.error('Укажите почту: npm run db:admin -- почта@пример.ру')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Нет SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY. Сначала: vercel env pull')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

// Пользователь мог уже войти сам — тогда создавать его повторно не нужно.
const { data: list, error: listError } = await admin.auth.admin.listUsers()
if (listError) {
  console.error('Не удалось получить список пользователей:', listError.message)
  process.exit(1)
}

let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

if (!user) {
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (error || !data.user) {
    console.error('Не удалось создать пользователя:', error?.message)
    process.exit(1)
  }
  user = data.user
  console.log(`Пользователь ${email} создан`)
} else {
  console.log(`Пользователь ${email} уже существует`)
}

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, { max: 1, prepare: false })
await sql`
  insert into public.admins (user_id, email) values (${user.id}, ${email})
  on conflict (user_id) do update set email = excluded.email
`
const [{ count }] = await sql`select count(*)::int as count from public.admins`
await sql.end()

console.log(`✓ ${email} — администратор. Всего администраторов: ${count}`)
