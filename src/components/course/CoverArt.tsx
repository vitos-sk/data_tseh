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
 *
 * Поверх всего идёт CRT-сетка (утилита crt): 1px краски, 3px пустоты.
 * Она приводит любую обложку — хоть градиент, хоть загруженную картинку —
 * к общему тону экрана старого монитора.
 */
export function CoverArt({ cover, className, children }: CoverArtProps) {
  return (
    <div
      className={cn('crt relative overflow-hidden', className)}
      style={{
        backgroundImage: `linear-gradient(140deg, ${toRedAxis(cover.from)} 0%, ${toRedAxis(cover.to)} 100%)`,
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
            className="absolute inset-0 size-full object-cover grayscale"
          />
          {/* Тонирование обесцвеченной картинки: загруженная в админку
              фотография тоже обязана остаться в палитре. */}
          <div className="absolute inset-0 bg-red mix-blend-color" />
        </>
      ) : (
        <Pattern pattern={cover.pattern} />
      )}
      {/* Лёгкое затемнение: собственный фон есть у бейджей и кнопок,
          поэтому обложке хватает 10% — картинка остаётся видимой. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-black/10" />
      {children}
    </div>
  )
}

/**
 * Любой цвет обложки — на красную ось.
 *
 * В данных (и в базе) градиенты остались от прежней темы: синие, зелёные,
 * оранжевые. Переписывать их не нужно — достаточно взять у цвета только
 * яркость и подмешать её к красному. Обложки остаются разными по глубине,
 * но ни одна не выпадает из палитры.
 */
function toRedAxis(hex: string): string {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex

  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  // Воспринимаемая яркость: зелёный весит больше синего
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  // От почти чёрного до осветлённого красного
  const mix = (dark: number, bright: number) => Math.round(dark + (bright - dark) * luma)
  const out = [mix(10, 255), mix(6, 59), mix(6, 59)]

  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function Pattern({ pattern }: { pattern: CourseCover['pattern'] }) {
  const common = 'absolute inset-0 h-full w-full'
  // Узор красный, а не белый: белые линии выбивались бы из палитры
  // сильнее, чем сама обложка.
  const stroke = '#dc2626'

  switch (pattern) {
    case 'rings':
      return (
        <svg className={common} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke={stroke} strokeOpacity="0.5" strokeWidth="1">
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
                strokeOpacity="0.42"
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
          <g fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5">
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
              <circle cx="3" cy="3" r="1.6" fill={stroke} fillOpacity="0.6" />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#cover-dots)" />
        </svg>
      )
  }
}
