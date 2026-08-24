import { cn } from '@/lib/cn'

interface ScreenProps {
  children: React.ReactNode
  /** Крупный заголовок в стиле iOS. Не задан — экран рисует шапку сам. */
  title?: string
  subtitle?: string
  /**
   * Таб-бар виден всегда, поэтому запас снизу нужен на каждом экране.
   * Проп оставлен для экранов с собственной нижней кнопкой.
   */
  withTabBar?: boolean
  className?: string
}

export function Screen({ children, title, subtitle, withTabBar = true, className }: ScreenProps) {
  return (
    <div
      className={cn('min-h-full', className)}
      style={{
        paddingTop: 'calc(var(--safe-top) + 8px)',
        paddingBottom: withTabBar
          ? 'calc(var(--tabbar-height) + var(--safe-bottom) + 24px)'
          : 'calc(var(--tabbar-height) + var(--safe-bottom) + 40px)',
      }}
    >
      {title && (
        <header className="px-5 pt-3 pb-5">
          <h1 className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  )
}
