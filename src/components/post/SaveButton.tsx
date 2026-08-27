import { Bookmark, BookmarkX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useLibraryStore } from '@/modules/library'
import { haptic } from '@/platform/telegram'

interface SaveButtonProps {
  postId: string
  /** На обложке нужна стеклянная подложка, в списке — вложенная поверхность. */
  variant?: 'glass' | 'inset'
}

/**
 * Закладка. Видимый квадрат остаётся 36px — на обложке крупнее он спорит
 * с картинкой, — но зона касания расширена псевдоэлементом до 48px:
 * промах мимо неё открывает пост вместо сохранения, потому что вся карточка
 * под кнопкой кликабельна.
 */
export function SaveButton({ postId, variant = 'glass' }: SaveButtonProps) {
  const saved = useLibraryStore((s) => s.saved.includes(postId))
  const toggle = useLibraryStore((s) => s.toggleSaved)
  const [full, setFull] = useState(false)

  // Отказ показываем ненадолго: он редкий и не должен застревать на экране.
  useEffect(() => {
    if (!full) return
    const timer = window.setTimeout(() => setFull(false), 3000)
    return () => window.clearTimeout(timer)
  }, [full])

  return (
    <>
      <button
        type="button"
        aria-label={saved ? 'Убрать из закладок' : 'Сохранить пост'}
        aria-pressed={saved}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          const result = toggle(postId)
          setFull(result === 'full')
          haptic(result === 'full' ? 'warning' : result === 'saved' ? 'success' : 'tap')
        }}
        className={cn(
          'press relative flex size-9 items-center justify-center rounded-btn border transition-colors duration-200',
          // Цель касания 48px при видимом квадрате 36px
          'after:absolute after:-inset-1.5 after:content-[""]',
          variant === 'glass' ? 'bg-black/50 backdrop-blur-sm' : 'bg-inset',
          full
            ? 'border-warn/50 text-warn'
            : saved
              ? 'border-accent text-accent-bright shadow-[var(--glow-accent)]'
              : 'border-hairline text-dim',
        )}
      >
        {full ? (
          <BookmarkX size={16} strokeWidth={2} />
        ) : (
          <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
        )}
      </button>

      {/* Скринридеру исход нужен словами: у иконки его не считать */}
      <span className="sr-only" role="status" aria-live="polite">
        {full ? 'Закладки переполнены, пост не сохранён' : ''}
      </span>
    </>
  )
}
