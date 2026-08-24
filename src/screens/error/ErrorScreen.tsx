import { Compass } from 'lucide-react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Экран для любой необработанной ошибки маршрута. Без него react-router
 * показывает свою страницу с советами разработчику — её однажды увидел
 * пользователь внутри Telegram.
 */
export function ErrorScreen() {
  const error = useRouteError()
  const navigate = useNavigate()

  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <EmptyState
        icon={<Compass size={26} />}
        title={notFound ? 'Такой страницы нет' : 'Что-то пошло не так'}
        text={
          notFound
            ? 'Ссылка ведёт в пустоту. Возможно, курс переименовали или удалили.'
            : 'Приложение споткнулось. Попробуйте вернуться на главную — обычно помогает.'
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="press rounded-full bg-cta px-6 py-3 text-[16px] font-semibold text-bg"
          >
            На главную
          </button>
        }
      />
    </div>
  )
}
