/**
 * Задаёт пароль администратору.
 * Запуск: npm run db:password -- почта@пример.ру [пароль]
 *
 * Без второго аргумента пароль генерируется и печатается один раз —
 * сохраните его в менеджере паролей, повторно узнать его нельзя.
 */
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
if (!email?.includes('@')) {
  console.error('Укажите почту: npm run db:password -- почта@пример.ру')
  process.exit(1)
}

// Без похожих друг на друга символов: пароль придётся читать глазами
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const generated = Array.from(randomBytes(20))
  .map((byte) => ALPHABET[byte % ALPHABET.length])
  .join('')

const password = process.argv[3] ?? generated

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

const { data: list, error: listError } = await admin.auth.admin.listUsers()
if (listError) {
  console.error('Не удалось получить пользователей:', listError.message)
  process.exit(1)
}

const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
if (!user) {
  console.error(`Пользователя ${email} нет. Сначала: npm run db:admin -- ${email}`)
  process.exit(1)
}

const { error } = await admin.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
})

if (error) {
  console.error('Не удалось задать пароль:', error.message)
  process.exit(1)
}

console.log(`✓ пароль для ${email} установлен`)
if (!process.argv[3]) console.log(`  ${password}`)
