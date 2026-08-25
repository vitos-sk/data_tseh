import { cn } from '@/lib/cn'

interface ScreenProps {
  children: React.ReactNode
  /** Крупный строчный заголовок экрана. Не задан — экран рисует шапку сам. */
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
      className={cn('relative min-h-full', className)}
      style={{
        paddingTop: 'calc(var(--safe-top) + 8px)',
        paddingBottom: withTabBar
          ? 'calc(var(--tabbar-height) + var(--safe-bottom) + 24px)'
          : 'calc(var(--tabbar-height) + var(--safe-bottom) + 40px)',
      }}
    >
      {title && (
        <header className="px-5 pt-4 pb-6">
          {/* Заголовок строчный, метка над ним — капсовая: тот самый контраст,
              на котором держится вся типографика. */}
          <p className="label mb-2.5 text-red">цех</p>
          <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[0.14em] lowercase">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 text-[13px] leading-[1.7] tracking-[0.02em] text-dim">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  )
}
