import { KeyRound, Lock, ServerCrash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAdminSession } from '@/modules/admin/useAdminSession'
import { supabase } from '@/platform/supabase'

/**
 * Пропускает в админку только того, кто вошёл и числится в таблице admins.
 * Это удобство, а не защита: настоящий запрет живёт в RLS-политиках базы,
 * и даже подделав этот экран, писать в каталог не получится.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { status, email, signOut } = useAdminSession()

  // Ссылка из письма возвращает токены во фрагменте URL. Клиент настроен
  // не трогать фрагмент автоматически (он занят Telegram), поэтому
  // разбираем его здесь — только на этом экране.
  useEffect(() => {
    if (!supabase) return
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash.includes('access_token=')) return

    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (!access_token || !refresh_token) return

    void supabase.auth.setSession({ access_token, refresh_token }).then(() => {
      // Токены не должны остаться в адресной строке и в истории
      window.history.replaceState(null, '', window.location.pathname)
    })
  }, [])

  if (status === 'unconfigured') {
    return (
      <AdminShell>
        <EmptyState
          icon={<ServerCrash size={26} />}
          title="База не подключена"
          text="Нет ключей Supabase. Пока приложение работает на данных из кода, и редактировать нечего."
        />
      </AdminShell>
    )
  }

  if (status === 'loading') {
    return (
      <AdminShell>
        <div className="px-5 py-20 text-center text-[15px] text-muted">Проверяем доступ…</div>
      </AdminShell>
    )
  }

  if (status === 'anonymous') {
    return (
      <AdminShell>
        <SignInForm />
      </AdminShell>
    )
  }

  if (status === 'forbidden') {
    return (
      <AdminShell>
        <EmptyState
          icon={<Lock size={26} />}
          title="Доступа нет"
          text={`Вы вошли как ${email ?? 'неизвестно кто'}, но этой почты нет в списке администраторов.`}
          action={
            <button
              type="button"
              onClick={() => void signOut()}
              className="press rounded-full bg-inset px-6 py-3 text-[16px] font-medium text-muted"
            >
              Выйти
            </button>
          }
        />
      </AdminShell>
    )
  }

  return <>{children}</>
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-10">
      <div className="w-full">{children}</div>
    </div>
  )
}

function SignInForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const send = async () => {
    if (!supabase || !email.trim()) return
    setState('sending')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })

    if (error) {
      setState('error')
      setMessage(error.message)
      return
    }
    setState('sent')
  }

  if (state === 'sent') {
    return (
      <EmptyState
        icon={<KeyRound size={26} />}
        title="Письмо отправлено"
        text={`Откройте ссылку из письма на ${email} — она вернёт вас сюда уже с доступом. Ссылка действует час.`}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[360px]">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-surface text-muted">
          <KeyRound size={26} />
        </span>
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em]">Вход в редакцию</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Введите почту — пришлём ссылку для входа. Пароль не нужен.
        </p>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void send()}
        placeholder="почта@пример.ру"
        autoComplete="email"
        className="mb-3 w-full rounded-full bg-inset px-5 py-3.5 text-[16px] outline-none placeholder:text-muted"
      />

      <button
        type="button"
        disabled={state === 'sending' || !email.includes('@')}
        onClick={() => void send()}
        className="press w-full rounded-full bg-cta py-3.5 text-[16px] font-semibold text-bg disabled:opacity-40"
      >
        {state === 'sending' ? 'Отправляем…' : 'Прислать ссылку'}
      </button>

      {state === 'error' && (
        <p className="mt-3 text-center text-[14px] leading-snug text-cat-orange">{message}</p>
      )}
    </div>
  )
}
