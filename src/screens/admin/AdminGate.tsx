import { Eye, EyeOff, KeyRound, Lock, ServerCrash } from 'lucide-react'
import { useState } from 'react'
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

  if (status === 'unconfigured') {
    return (
      <AdminShell>
        <EmptyState
          icon={<ServerCrash size={24} />}
          title="база не подключена"
          text="Нет ключей Supabase. Пока приложение работает на данных из кода, и редактировать нечего."
        />
      </AdminShell>
    )
  }

  if (status === 'loading') {
    return (
      <AdminShell>
        <div className="label px-5 py-20 text-center text-dim">проверяем доступ…</div>
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
          icon={<Lock size={24} />}
          title="доступа нет"
          text={`Вы вошли как ${email ?? 'неизвестно кто'}, но этой почты нет в списке администраторов.`}
          action={
            <button
              type="button"
              onClick={() => void signOut()}
              className="press rounded-btn border border-hairline bg-inset px-6 py-3 text-[14px] font-medium tracking-[0.06em] text-dim"
            >
              выйти
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

/**
 * Вход по почте и паролю.
 *
 * Ссылку на почту пришлось отложить: Supabase отправляет письмо на адрес
 * из настройки Site URL, а она по умолчанию указывает на localhost:3000.
 * Поменять её можно только в панели Supabase, поэтому пока — пароль.
 */
function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const signIn = async () => {
    if (!supabase || !email.trim() || !password) return
    setState('sending')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setState('error')
      setMessage(
        error.message === 'Invalid login credentials'
          ? 'Почта или пароль не подходят'
          : error.message,
      )
    }
    // При успехе экран сменится сам: useAdminSession увидит новую сессию.
  }

  return (
    <div className="mx-auto max-w-[360px]">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="glass mb-5 flex size-14 items-center justify-center rounded-card text-accent">
          <KeyRound size={24} />
        </span>
        <h1 className="text-[20px] font-extrabold tracking-[0.14em] lowercase">вход в редакцию</h1>
        <p className="label mt-3 text-dim">почта и пароль администратора</p>
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="почта@пример.ру"
        autoComplete="username"
        className="mb-2.5 w-full rounded-btn border border-hairline bg-inset px-4 py-3.5 text-[15px] tracking-[0.02em] caret-[var(--color-accent-bright)] outline-none placeholder:text-dim"
      />

      <div className="mb-4 flex items-center gap-2 rounded-btn border border-hairline bg-inset pr-3 pl-4">
        <input
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void signIn()}
          placeholder="пароль"
          autoComplete="current-password"
          className="min-w-0 flex-1 bg-transparent py-3.5 text-[15px] tracking-[0.02em] caret-[var(--color-accent-bright)] outline-none placeholder:text-dim"
        />
        <button
          type="button"
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setVisible((v) => !v)}
          className="press shrink-0 text-dim"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        type="button"
        disabled={state === 'sending' || !email.includes('@') || password.length === 0}
        onClick={() => void signIn()}
        className="btn-arm w-full disabled:opacity-40"
      >
        {state === 'sending' ? 'входим…' : 'войти'}
      </button>

      {state === 'error' && (
        <p className="mt-3 text-center text-[14px] leading-snug text-accent-bright">{message}</p>
      )}
    </div>
  )
}
