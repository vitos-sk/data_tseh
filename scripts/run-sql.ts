/**
 * Выполняет SQL-файл в базе Supabase.
 * Запуск: npm run db:apply -- supabase/migrations/0001_init.sql
 *
 * Подключение берётся из POSTGRES_URL_NON_POOLING (.env.local, который
 * прописала интеграция Vercel). Пулер для DDL не годится: миграция идёт
 * одной транзакцией и требует постоянного соединения.
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

const file = process.argv[2]
if (!file) {
  console.error('Укажите файл: npm run db:apply -- supabase/migrations/0001_init.sql')
  process.exit(1)
}

const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL
if (!url) {
  console.error('Нет POSTGRES_URL_NON_POOLING. Сначала: vercel env pull')
  process.exit(1)
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} })

try {
  const text = readFileSync(file, 'utf8')
  await sql.unsafe(text)
  console.log(`✓ ${file} выполнен`)
} catch (error) {
  console.error(`✗ ${file}:`, error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
