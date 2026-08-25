import { BookmarkPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PostRow } from '@/components/post/PostRow'
import { Screen } from '@/components/layout/Screen'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/lib/useAsync'
import { catalogRepository } from '@/modules/catalog'
import { useLibraryStore } from '@/modules/library'

export function SavedScreen() {
  const navigate = useNavigate()
  const hydrated = useLibraryStore((s) => s.hydrated)
  const saved = useLibraryStore((s) => s.saved)

  // Экран — то самое место, где сходятся «Личное» и «Каталог»:
  // стор хранит только id, содержимое приезжает из репозитория.
  const { data: posts, loading } = useAsync(
    () => catalogRepository.getPostsByIds(saved),
    [saved.join(',')],
  )

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
          text="Нажмите на закладку у любого поста — он появится здесь и не потеряется."
          action={
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="btn-arm"
            >
              открыть каталог
            </button>
          }
        />
      )}

      {!busy && saved.length > 0 && (
        <div className="flex flex-col gap-2.5 px-5">
          {posts?.map((post) => <PostRow key={post.id} post={post} />)}
        </div>
      )}
    </Screen>
  )
}
