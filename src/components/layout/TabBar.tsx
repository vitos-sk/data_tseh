import { Bookmark, House, LayoutGrid, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'

const TABS = [
  { to: '/', label: 'Главная', Icon: House, end: true },
  { to: '/catalog', label: 'Каталог', Icon: LayoutGrid, end: false },
  { to: '/saved', label: 'Закладки', Icon: Bookmark, end: false },
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
      className="absolute inset-x-0 bottom-0 z-40 border-t border-red/20 bg-bg/90 backdrop-blur-md"
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
                  'relative flex h-full flex-col items-center justify-center gap-1.5',
                  'transition-colors duration-200',
                  isActive || (courseIsOpen && to === '/catalog')
                    ? 'text-red-bright'
                    : 'text-dim',
                )
              }
            >
              {({ isActive }) => {
                const active = isActive || (courseIsOpen && to === '/catalog')
                return (
                  <>
                    {/* Красная риска сверху: у активной вкладки «горит» контакт */}
                    {active && (
                      <span className="absolute inset-x-5 top-0 h-px bg-red shadow-[0_0_8px_rgba(220,38,38,0.7)]" />
                    )}
                    <span className="relative">
                      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                      {to === '/saved' && savedCount > 0 && (
                        <span
                          className={cn(
                            'absolute -top-1 -right-2 flex min-w-4 justify-center rounded-[2px] px-1',
                            'text-[9.5px] leading-4 font-bold tabular-nums',
                            active ? 'bg-red text-white' : 'bg-inset text-dim',
                          )}
                        >
                          {savedCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] font-medium tracking-[0.18em] uppercase">
                      {label}
                    </span>
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
