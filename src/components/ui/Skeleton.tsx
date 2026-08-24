import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-inset', className)} />
}

/** Заглушка ленты курсов на время загрузки — повторяет геометрию карточки. */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-3">
      <Skeleton className="mb-3 h-40 w-full rounded-2xl" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
