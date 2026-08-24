import { useEffect } from 'react'
import { cn } from '@/lib/cn'
import { RouterProvider } from 'react-router-dom'
import { useSettingsStore } from '@/modules/settings/settings.store'
import { initTelegram } from '@/platform/telegram'
import { router } from './routes'

export function App() {
  // Один раз на старте: разворачиваем окно, красим шапку, ловим высоту вьюпорта.
  useEffect(() => initTelegram(), [])

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
          'md:my-5 md:h-[calc(100%-2.5rem)] md:rounded-[28px] md:ring-1 md:ring-white/10',
        )}
      >
        <RouterProvider router={router} />
      </div>
    </div>
  )
}
