import { Outlet, useLocation } from 'react-router-dom'
import { MatrixRain } from '@/components/fx/MatrixRain'
import { ScrollArea } from './ScrollArea'
import { TabBar } from './TabBar'

/** Оболочка приложения: скроллируемая область экрана + постоянный таб-бар. */
export function AppLayout() {
  const { pathname } = useLocation()

  // Матричный дождь живёт только на Главной и только здесь, на уровне колонки:
  // внутри скроллируемого экрана canvas растянулся бы на всю высоту ленты.
  // На остальных экранах стиль держат свет, стекло и моноширинный шрифт.
  const withMatrix = pathname === '/'

  return (
    <div className="relative h-full">
      {withMatrix && <MatrixRain />}

      <ScrollArea>
        {/* key по маршруту перезапускает анимацию появления на каждом экране */}
        <div key={pathname} className="screen-in relative min-h-full">
          <Outlet />
        </div>
      </ScrollArea>
      <TabBar />
    </div>
  )
}
