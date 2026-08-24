import { cn } from '@/lib/cn'
import type { CourseCover } from '@/modules/catalog'

interface CoverArtProps {
  cover: CourseCover
  className?: string
  children?: React.ReactNode
}

/**
 * Обложка курса. Настоящих картинок пока нет, поэтому рисуем градиент
 * с геометрическим узором — весит ноль и не требует загрузки.
 * Когда появятся файлы, сюда добавится проп src, а градиент останется фолбэком.
 */
export function CoverArt({ cover, className, children }: CoverArtProps) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundImage: `linear-gradient(140deg, ${cover.from} 0%, ${cover.to} 100%)` }}
    >
      <Pattern pattern={cover.pattern} />
      {/* Затемнение снизу: под бейджами и текстом всегда должно читаться */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
      {children}
    </div>
  )
}

function Pattern({ pattern }: { pattern: CourseCover['pattern'] }) {
  const common = 'absolute inset-0 h-full w-full'

  switch (pattern) {
    case 'rings':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1">
            {[18, 34, 50, 66, 82, 98].map((r) => (
              <circle key={r} cx="158" cy="26" r={r} />
            ))}
          </g>
        </svg>
      )

    case 'grid':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="cover-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0H0V16" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#cover-grid)" />
        </svg>
      )

    case 'waves':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="none">
          <g fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5">
            {[0, 22, 44, 66, 88].map((offset) => (
              <path
                key={offset}
                d={`M-10 ${40 + offset} C 40 ${10 + offset}, 80 ${70 + offset}, 130 ${40 + offset} S 220 ${10 + offset}, 230 ${45 + offset}`}
              />
            ))}
          </g>
        </svg>
      )

    case 'dots':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="cover-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.6" fill="#fff" fillOpacity="0.28" />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#cover-dots)" />
        </svg>
      )
  }
}
