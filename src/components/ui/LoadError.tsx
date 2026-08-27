import { WifiOff } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface LoadErrorProps {
  /** Что именно не приехало: «каталог», «пост», «закладки». */
  what: string
  onRetry: () => void
  /** Текст под заголовком, если у экрана есть что добавить. */
  hint?: string
}

/**
 * Сеть не ответила. Отдельное состояние, а не пустой список: мини-апп
 * открывают в метро и в лифте, и «ничего нет» там означает совсем другое,
 * чем «не дозвонились».
 *
 * Ошибка обязана назвать причину и путь наружу — поэтому здесь всегда есть
 * кнопка «повторить», а не только текст.
 */
export function LoadError({ what, onRetry, hint }: LoadErrorProps) {
  return (
    <EmptyState
      tone="alert"
      icon={<WifiOff size={24} />}
      title="нет связи"
      text={hint ?? `Не удалось загрузить ${what}. Проверьте сеть и попробуйте ещё раз.`}
      action={
        <button type="button" onClick={onRetry} className="btn-arm">
          повторить
        </button>
      }
    />
  )
}
