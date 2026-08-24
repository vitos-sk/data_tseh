import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Переменные приходят из интеграции Supabase на Vercel — префикс VITE_PUBLIC_
 * задан при её установке. Anon-ключ публичен по замыслу: доступ ограничивают
 *政 RLS-политики в самой базе, а не секретность ключа.
 */
const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string | undefined

/** Ключи заданы — значит можно ходить в базу. Иначе приложение живёт на моках. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey)
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Вход по ссылке из письма возвращает пользователя с токенами
        // во фрагменте URL — тот самый фрагмент, который в Telegram занят
        // своими данными. Разбираем его сами только на экране входа.
        detectSessionInUrl: false,
      },
    })
  : null

/** Клиент там, где без него нельзя. Бросает, если Supabase не настроен. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase не настроен: нет VITE_PUBLIC_SUPABASE_URL или VITE_PUBLIC_SUPABASE_ANON_KEY',
    )
  }
  return supabase
}
