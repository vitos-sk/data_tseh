import { Bookmark, House, LayoutGrid, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'

const TABS = [
  { to: '/', label: 'Главная', Icon: House, end: true },
  { to: '/catalog', label: 'Каталог', Icon: LayoutGrid, end: false },
  { to: '/saved', label: 'Сохранённое', Icon: Bookmark, end: false },
  { to: '/profile', label: 'Профиль', Icon: User, end: false },
] as const

/**
 * Нижний таб-бар. Виден на всех экранах, включая курс и урок: из чтения
 * всегда можно уйти одним нажатием, не разыскивая кнопку «назад».
 *
 * Позиционирование absolute, а не fixed: на ПК приложение живёт в колонке
 * ограниченной ширины, и fixed растянул бы панель на весь монитор.
 */
export function TabBar() {
  const savedCount = useLibraryStore((s) => s.saved.length)
  const { pathname } = useLocation()

  // Курс и урок — продолжение каталога: подсвечиваем его, чтобы панель
  // не выглядела «погасшей» во время чтения.
  const courseIsOpen = pathname.startsWith('/course')

  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-40 border-t border-hairline bg-bg/85 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="flex h-[var(--tabbar-height)] items-stretch">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              onClick={() => haptic('select')}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1',
                  'transition-colors duration-200',
                  isActive || (courseIsOpen && to === '/catalog') ? 'text-gold' : 'text-muted',
                )
              }
            >
              {({ isActive }) => {
                const active = isActive || (courseIsOpen && to === '/catalog')
                return (
                  <>
                    <span className="relative">
                      <Icon size={23} strokeWidth={active ? 2.4 : 1.9} />
                      {to === '/saved' && savedCount > 0 && (
                        <span
                          className={cn(
                            'absolute -top-0.5 -right-1.5 flex min-w-4 justify-center rounded-full px-1',
                            'text-[10px] leading-4 font-bold',
                            active ? 'bg-gold text-bg' : 'bg-inset text-fg',
                          )}
                        >
                          {savedCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[10.5px] font-medium tracking-tight">{label}</span>
                  </>
                )
              }}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
