import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Куда был прокручен каждый экран. Живёт до перезагрузки — этого достаточно. */
const positions = new Map<string, number>()

/**
 * Скроллируемая область экрана. Корень приложения зафиксирован по высоте
 * вьюпорта Telegram и не скроллится сам — прокрутка живёт здесь.
 *
 * Новый экран открывается сверху, а возврат — там, где человек его оставил.
 * Раньше сброс шёл на любую смену адреса, и самый частый жест продукта —
 * пролистал каталог, открыл пост, вернулся — каждый раз стоил всей ленты
 * заново.
 */
export function ScrollArea({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // POP — это «назад»: и нативной кнопкой Telegram, и жестом, и браузером.
    if (navigationType === 'POP') node.scrollTo({ top: positions.get(pathname) ?? 0 })
    else node.scrollTo({ top: 0 })

    // Позицию пишем на уходе с экрана, а не на каждом кадре прокрутки:
    // обработчик scroll на телефоне стоит дороже, чем одно чтение.
    return () => {
      positions.set(pathname, node.scrollTop)
    }
  }, [pathname, navigationType])

  return (
    <div ref={ref} className="h-full overflow-y-auto overscroll-contain">
      {children}
    </div>
  )
}
