import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { COLORS } from '@/app/colors'
import { CoverArt } from '@/components/post/CoverArt'
import type { PostBlock } from '@/modules/catalog'
import { CodeBlock } from './blocks/CodeBlock'
import { CommandBlock } from './blocks/CommandBlock'
import { PromptBlock } from './blocks/PromptBlock'

/**
 * Рендер одного блока поста. Новый вид контента добавляется сюда одной веткой —
 * экран поста при этом не меняется (docs/decisions/0004).
 *
 * Кегль и межстрочный интервал здесь выше, чем в списках: моноширинный шрифт
 * читается плотнее пропорционального, и длинный текст без запаса по строке
 * превращается в стену.
 */
export function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="mt-4 type-heading font-bold tracking-[0.12em]">
          <span className="mr-2 text-accent">#</span>
          {block.text}
        </h2>
      )

    case 'text':
      return (
        <p className="type-ui tracking-[0.01em] text-muted">{block.text}</p>
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
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[2px] border border-accent/25 bg-accent/[0.07] type-micro font-bold text-accent-bright tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 type-ui tracking-[0.01em] text-muted">
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
              <span className="mt-[10px] size-1.5 shrink-0 bg-accent" />
              <span className="flex-1 type-ui tracking-[0.01em] text-muted">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="border-l-2 border-accent pl-4">
          <p className="type-ui tracking-[0.02em] text-fg">{block.text}</p>
          {block.author && (
            <cite className="label mt-2.5 block text-dim not-italic">— {block.author}</cite>
          )}
        </blockquote>
      )

    case 'callout': {
      // Зелёный и жёлтый допущены только здесь и только как статус —
      // остального цвета в интерфейсе нет. У белого альфы ниже: на чёрном
      // он перекрывает статусные тона при одинаковой прозрачности.
      const TONE = {
        info: { color: COLORS.accentBright, tint: '0d', edge: '26', Icon: Info },
        warning: { color: COLORS.warn, tint: '12', edge: '33', Icon: AlertTriangle },
        success: { color: COLORS.ok, tint: '12', edge: '33', Icon: CheckCircle2 },
      }[block.tone]

      return (
        <div
          className="flex gap-3 rounded-card border p-3.5"
          style={{ backgroundColor: `${TONE.color}${TONE.tint}`, borderColor: `${TONE.color}${TONE.edge}` }}
        >
          <TONE.Icon size={17} color={TONE.color} className="mt-0.5 shrink-0" />
          <p className="type-body tracking-[0.01em] text-muted">{block.text}</p>
        </div>
      )
    }

    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />

    case 'command':
      return <CommandBlock command={block.command} note={block.note} />

    case 'prompt':
      return <PromptBlock text={block.text} title={block.title} />
  }
}

export function BlockRenderer({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
