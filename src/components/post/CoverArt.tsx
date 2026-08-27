import { cn } from '@/lib/cn'
import type { PostCover } from '@/modules/catalog'

interface CoverArtProps {
  cover: PostCover
  className?: string
  children?: React.ReactNode
}

/**
 * Обложка поста. Если картинки нет — рисуем градиент с геометрическим
 * узором: весит ноль и не требует загрузки.
 *
 * Фотографии показываем как есть: ни плёнки, ни обесцвечивания, ни
 * затемнения. Интерфейс монохромный целиком, и именно поэтому кадр
 * внутри него имеет право остаться цветным — он и есть содержание.
 */
export function CoverArt({ cover, className, children }: CoverArtProps) {
  const hasImage = Boolean(cover.imageUrl)

  return (
    <div
      className={cn('relative overflow-hidden', !hasImage && 'crt', className)}
      style={{
        backgroundImage: `linear-gradient(140deg, ${toMonoAxis(cover.from)} 0%, ${toMonoAxis(cover.to)} 100%)`,
      }}
    >
      {cover.imageUrl ? (
        <>
          {/* Градиент под картинкой виден, пока она грузится, и остаётся,
              если ссылка битая — пустого белого прямоугольника не будет. */}
          <img
            src={cover.imageUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        </>
      ) : (
        <>
          <Pattern pattern={cover.pattern} />
          {/* Лёгкое затемнение только под узором: у бейджей и кнопок
              есть собственный фон, поэтому обложке хватает 10%. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-black/10" />
        </>
      )}
      {children}
    </div>
  )
}

/**
 * Любой цвет обложки — на нейтральную ось.
 *
 * В данных (и в базе) градиенты остались от прежней темы: синие, зелёные,
 * оранжевые. Переписывать их не нужно — достаточно оставить от цвета одну
 * яркость. Обложки остаются разными по глубине, но ни одна не выпадает
 * из палитры, потому что палитры как таковой больше нет.
 */
function toMonoAxis(hex: string): string {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex

  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  // Воспринимаемая яркость: зелёный весит больше синего
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  // От почти чёрного до притушенного акцента. Верх шкалы намеренно не белый:
  // обложка — поверхность, а не источник света.
  const level = Math.round(10 + (0x7a - 10) * luma)
  const channel = level.toString(16).padStart(2, '0')

  return `#${channel.repeat(3)}`
}

function Pattern({ pattern }: { pattern: PostCover['pattern'] }) {
  const common = 'absolute inset-0 h-full w-full'
  // Узор светится тем же светом, что и рамки. Прозрачности ниже прежних:
  // белая линия на графите читается сильнее, чем прежняя на бордовом.
  const stroke = '#f5f5f5'

  switch (pattern) {
    case 'rings':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke={stroke} strokeOpacity="0.38" strokeWidth="1">
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
              <path
                d="M16 0H0V16"
                fill="none"
                stroke={stroke}
                strokeOpacity="0.32"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#cover-grid)" />
        </svg>
      )

    case 'waves':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="none">
          <g fill="none" stroke={stroke} strokeOpacity="0.34" strokeWidth="1.5">
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
              <circle cx="3" cy="3" r="1.6" fill={stroke} fillOpacity="0.45" />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#cover-dots)" />
        </svg>
      )
  }
}
