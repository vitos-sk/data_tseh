import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/platform/supabase'

export type AdminStatus =
  /** Ключи Supabase не заданы — админка работать не может */
  | 'unconfigured'
  /** Проверяем сессию */
  | 'loading'
  /** Не вошёл */
  | 'anonymous'
  /** Вошёл, но его нет в белом списке admins */
  | 'forbidden'
  /** Вошёл и имеет права */
  | 'admin'

interface AdminSession {
  status: AdminStatus
  email: string | null
  signOut: () => Promise<void>
}

/**
 * Определяет, можно ли пускать в админку. Одного факта входа мало:
 * право на запись даёт строка в таблице admins, и проверяет его база,
 * а не интерфейс. Здесь мы лишь спрашиваем у базы ответ, чтобы показать
 * человеку понятный экран вместо потока ошибок доступа.
 */
export function useAdminSession(): AdminSession {
  const [status, setStatus] = useState<AdminStatus>(
    isSupabaseConfigured() ? 'loading' : 'unconfigured',
  )
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let alive = true

    const check = async (session: Session | null) => {
      if (!session) {
        if (alive) {
          setEmail(null)
          setStatus('anonymous')
        }
        return
      }

      setEmail(session.user.email ?? null)

      // RLS отдаёт строку только своему владельцу — пустой ответ означает,
      // что прав нет.
      const { data, error } = await supabase!
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!alive) return
      setStatus(!error && data ? 'admin' : 'forbidden')
    }

    void supabase.auth.getSession().then(({ data }) => check(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void check(session)
    })

    return () => {
      alive = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    status,
    email,
    signOut: async () => {
      await supabase?.auth.signOut()
    },
  }
}
