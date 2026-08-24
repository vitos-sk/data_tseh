import { Outlet, useLocation } from 'react-router-dom'
import { ScrollArea } from './ScrollArea'
import { TabBar } from './TabBar'

/** Оболочка приложения: скроллируемая область экрана + постоянный таб-бар. */
export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="relative h-full">
      <ScrollArea>
        {/* key по маршруту перезапускает анимацию появления на каждом экране */}
        <div key={pathname} className="screen-in min-h-full">
          <Outlet />
        </div>
      </ScrollArea>
      <TabBar />
    </div>
  )
}
