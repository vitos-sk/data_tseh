import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-card bg-accent/6', className)} />
}

/** Заглушка ленты постов на время загрузки — повторяет геометрию карточки. */
export function PostCardSkeleton() {
  return (
    <div className="glass rounded-card p-3">
      <Skeleton className="mb-3 h-40 w-full" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
