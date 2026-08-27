import { useEffect } from 'react'
import { cn } from '@/lib/cn'
import { RouterProvider } from 'react-router-dom'
import { useSettingsStore } from '@/modules/settings/settings.store'
import { initTelegram } from '@/platform/telegram'
import { getStartPostSlug } from '@/platform/telegram/webapp'
import { router } from './routes'

export function App() {
  // Один раз на старте: разворачиваем окно, красим шапку, ловим высоту вьюпорта.
  // Плюс разбираем ссылку, по которой мини-апп открыли: пост, присланный
  // в чат, обязан открыться постом, а не Главной.
  useEffect(() => {
    const stop = initTelegram()
    const slug = getStartPostSlug()
    if (slug) void router.navigate(`/p/${slug}`, { replace: true })
    return stop
  }, [])

  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  // Настройка из профиля должна что-то делать: правим атрибут на <html>,
  // остальное разбирает CSS в theme.css.
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
  }, [reducedMotion])

  return (
    <div className="flex h-[var(--tg-stable-height)] justify-center bg-page">
      {/*
        На телефоне колонка занимает всю ширину. На ПК — ограничена и отделена
        от «стола» рамкой: интерфейс мобильный, растягивать его на монитор
        было бы неправильно.
      */}
      <div
        className={cn(
          'relative h-full w-full max-w-[var(--app-width)] overflow-hidden bg-bg',
          'md:my-5 md:h-[calc(100%-2.5rem)] md:rounded-lg md:ring-1 md:ring-accent/14',
        )}
      >
        <RouterProvider router={router} />
      </div>
    </div>
  )
}
