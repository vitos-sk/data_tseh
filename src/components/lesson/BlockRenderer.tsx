import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { COLORS } from '@/app/colors'
import { CoverArt } from '@/components/course/CoverArt'
import type { LessonBlock } from '@/modules/catalog'

/**
 * Рендер одного блока урока. Новый вид контента добавляется сюда одной веткой —
 * экран урока при этом не меняется (docs/decisions/0004).
 *
 * Кегль и межстрочный интервал здесь выше, чем в списках: моноширинный шрифт
 * читается плотнее пропорционального, и длинный текст без запаса по строке
 * превращается в стену.
 */
export function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="mt-4 text-[17px] leading-tight font-bold tracking-[0.12em]">
          <span className="mr-2 text-red">#</span>
          {block.text}
        </h2>
      )

    case 'text':
      return (
        <p className="text-[14.5px] leading-[1.85] tracking-[0.01em] text-muted">{block.text}</p>
      )

    case 'image':
      return (
        <figure>
          <CoverArt cover={block.cover} className="h-44 rounded-card" />
          {block.caption && (
            <figcaption className="label mt-2.5 px-1 text-dim">{block.caption}</figcaption>
          )}
        </figure>
      )

    case 'list':
      return block.ordered ? (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[2px] border border-red/35 bg-red/10 text-[11px] font-bold text-red-bright tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 text-[14.5px] leading-[1.8] tracking-[0.01em] text-muted">
                {item}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              {/* Маркер — квадрат, а не точка: круглых форм в интерфейсе нет */}
              <span className="mt-[10px] size-1.5 shrink-0 bg-red" />
              <span className="flex-1 text-[14.5px] leading-[1.8] tracking-[0.01em] text-muted">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="border-l-2 border-red pl-4">
          <p className="text-[15px] leading-[1.7] tracking-[0.02em] text-fg">{block.text}</p>
          {block.author && (
            <cite className="label mt-2.5 block text-dim not-italic">— {block.author}</cite>
          )}
        </blockquote>
      )

    case 'callout': {
      // Зелёный и жёлтый допущены только здесь и только как статус —
      // остального цвета в интерфейсе нет.
      const TONE = {
        info: { color: COLORS.redBright, Icon: Info },
        warning: { color: COLORS.warn, Icon: AlertTriangle },
        success: { color: COLORS.ok, Icon: CheckCircle2 },
      }[block.tone]

      return (
        <div
          className="flex gap-3 rounded-card border p-3.5"
          style={{ backgroundColor: `${TONE.color}12`, borderColor: `${TONE.color}33` }}
        >
          <TONE.Icon size={17} color={TONE.color} className="mt-0.5 shrink-0" />
          <p className="text-[13.5px] leading-[1.7] tracking-[0.01em] text-muted">{block.text}</p>
        </div>
      )
    }

    case 'code':
      return (
        <pre className="overflow-x-auto rounded-card border border-hairline bg-black/60 p-4">
          <code className="text-[12.5px] leading-[1.7] whitespace-pre text-fg">{block.code}</code>
        </pre>
      )
  }
}

export function BlockRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
