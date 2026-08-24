import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Скроллируемая область экрана. Корень приложения зафиксирован по высоте
 * вьюпорта Telegram и не скроллится сам — прокрутка живёт здесь.
 */
export function ScrollArea({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  // Новый экран открывается сверху, а не там, где остался прошлый.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div ref={ref} className="h-full overflow-y-auto">
      {children}
    </div>
  )
}
