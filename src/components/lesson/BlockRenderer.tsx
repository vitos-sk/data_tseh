import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { CoverArt } from '@/components/course/CoverArt'
import { COLORS } from '@/app/colors'
import type { LessonBlock } from '@/modules/catalog'

/**
 * Рендер одного блока урока. Новый вид контента добавляется сюда одной веткой —
 * экран урока при этом не меняется (docs/decisions/0004).
 */
export function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="mt-3 text-[21px] leading-tight font-bold tracking-[-0.02em]">
          {block.text}
        </h2>
      )

    case 'text':
      return <p className="text-[16.5px] leading-[1.6] text-white/85">{block.text}</p>

    case 'image':
      return (
        <figure>
          <CoverArt cover={block.cover} className="h-44 rounded-2xl" />
          {block.caption && (
            <figcaption className="mt-2 px-1 text-[13.5px] leading-snug text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    case 'list':
      return block.ordered ? (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-inset text-[13px] font-bold text-gold tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 text-[16px] leading-[1.55] text-white/85">{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-gold" />
              <span className="flex-1 text-[16px] leading-[1.55] text-white/85">{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="border-l-2 border-gold pl-4">
          <p className="text-[17px] leading-[1.5] font-medium text-white/90 italic">
            {block.text}
          </p>
          {block.author && <cite className="mt-2 block text-[14px] text-muted not-italic">— {block.author}</cite>}
        </blockquote>
      )

    case 'callout': {
      const TONE = {
        info: { color: COLORS.blue, Icon: Info },
        warning: { color: COLORS.orange, Icon: AlertTriangle },
        success: { color: COLORS.green, Icon: CheckCircle2 },
      }[block.tone]

      return (
        <div
          className="flex gap-3 rounded-[var(--radius-inset)] p-3.5"
          style={{ backgroundColor: `${TONE.color}14` }}
        >
          <TONE.Icon size={19} color={TONE.color} className="mt-0.5 shrink-0" />
          <p className="text-[15.5px] leading-[1.5] text-white/85">{block.text}</p>
        </div>
      )
    }

    case 'code':
      return (
        <pre className="overflow-x-auto rounded-[var(--radius-inset)] bg-inset p-4">
          <code className="font-mono text-[13.5px] leading-[1.6] whitespace-pre text-white/90">
            {block.code}
          </code>
        </pre>
      )
  }
}

export function BlockRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
