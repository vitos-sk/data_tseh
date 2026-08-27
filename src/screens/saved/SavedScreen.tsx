import { BookmarkPlus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostRow } from '@/components/post/PostRow'
import { Screen } from '@/components/layout/Screen'
import { Terminal } from '@/components/fx/Terminal'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadError } from '@/components/ui/LoadError'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository, readCachedPostsByIds } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'

export function SavedScreen() {
  const navigate = useNavigate()
  const hydrated = useLibraryStore((s) => s.hydrated)
  const saved = useLibraryStore((s) => s.saved)

  // Экран — то самое место, где сходятся «Личное» и «Каталог»:
  // стор хранит только id, содержимое приезжает из репозитория.
  const { data: fetched, loading, error, retry } = useAsync(
    () => catalogRepository.getPostsByIds(saved),
    [saved.join(',')],
  )

  /*
   * Сеть не ответила — достаём копии прочитанных постов с устройства.
   * Закладка обещает «вернусь к этому позже», а «позже» в мини-аппе
   * обычно означает «в дороге, без связи».
   */
  const cached = useMemo(() => (error ? readCachedPostsByIds(saved) : []), [error, saved])
  const posts = fetched ?? cached
  const offline = Boolean(error && cached.length > 0)

  const busy = !hydrated || loading

  return (
    <Screen title="закладки" subtitle="Посты, к которым вы хотите вернуться">
      {busy && (
        <div className="flex flex-col gap-2.5 px-5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))}
        </div>
      )}

      {!busy && saved.length === 0 && (
        <EmptyState
          icon={<BookmarkPlus size={24} />}
          title="пока ничего не сохранено"
          text="Нажмите на закладку у любого поста. Он появится здесь и останется читаемым даже без сети."
          action={
            <button type="button" onClick={() => navigate('/catalog')} className="btn-arm">
              открыть каталог
            </button>
          }
        />
      )}

      {/* Ни сети, ни копий — единственный случай, когда закладки правда пусты */}
      {!busy && saved.length > 0 && error && cached.length === 0 && (
        <LoadError
          what="закладки"
          onRetry={retry}
          hint="Сеть не отвечает, а копий этих постов на устройстве нет — вы их ещё не открывали."
        />
      )}

      {!busy && posts.length > 0 && (
        <>
          {offline && (
            <div className="mb-4 px-5">
              <Terminal caret={false} lines={['сети нет — открыты сохранённые копии']} />
            </div>
          )}
          <div className="flex flex-col gap-2.5 px-5">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </Screen>
  )
}
