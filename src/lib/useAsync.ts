import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Загружает данные из репозитория и следит, чтобы ответ на устаревший запрос
 * не перезаписал актуальный. Когда появится настоящий API, этот хук
 * заменяется на TanStack Query без правки экранов (docs/decisions/0006).
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  // Список зависимостей приходит параметром — статически проверить его нельзя.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let alive = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    load()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error: Error) => alive && setState({ data: null, loading: false, error }))

    return () => {
      alive = false
    }
  }, deps)

  return state
}
