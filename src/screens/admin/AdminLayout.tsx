import { LogOut } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAdminSession } from '@/modules/admin/useAdminSession'
import { adminPath } from './adminPath'

/** Оболочка админки: своя шапка, без таб-бара приложения. */
export function AdminLayout() {
  const { email, signOut } = useAdminSession()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div ref={scroller} className="h-full overflow-y-auto">
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-bg/90 px-5 pb-3 backdrop-blur-xl"
        style={{ paddingTop: 'calc(var(--safe-top) + 12px)' }}
      >
        <button
          type="button"
          onClick={() => navigate(adminPath())}
          className="press min-w-0 flex-1 text-left"
        >
          <p className="text-[16px] font-bold tracking-[-0.01em]">Редакция</p>
          <p className="truncate text-[12.5px] text-muted">{email}</p>
        </button>

        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Выйти"
          className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-inset text-muted"
        >
          <LogOut size={17} />
        </button>
      </header>

      <div className="pb-[calc(var(--safe-bottom)+40px)]">
        <Outlet />
      </div>
    </div>
  )
}
