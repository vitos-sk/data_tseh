import { useCallback, useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  /** Повторить запрос. То, что вызывает кнопка «повторить» в состоянии ошибки. */
  retry: () => void
}

/**
 * Загружает данные из репозитория и следит, чтобы ответ на устаревший запрос
 * не перезаписал актуальный. Когда появится настоящий API, этот хук
 * заменяется на TanStack Query без правки экранов (docs/decisions/0006).
 *
 * Ошибку хук не глотает: мобильная сеть падает регулярно, и экран обязан
 * сказать об этом словами, а не остаться пустым.
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<Omit<AsyncState<T>, 'retry'>>({
    data: null,
    loading: true,
    error: null,
  })
  // Счётчик попыток входит в зависимости эффекта: увеличили — запрос ушёл заново.
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

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
  }, [...deps, attempt])

  return { ...state, retry }
}
