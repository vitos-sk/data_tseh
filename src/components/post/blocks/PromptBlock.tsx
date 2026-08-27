import { CopyButton } from '../CopyButton'

/**
 * Промт для нейросети. Шрифт в интерфейсе один на всё, поэтому от блока кода
 * промт отличается вёрсткой: широкий межстрочный интервал прозы, перенос по
 * словам и копирование во всю ширину — здесь это главное действие, а не
 * мелкая кнопка в углу.
 */
export function PromptBlock({ text, title }: { text: string; title?: string }) {
  return (
    <div className="rounded-card border border-accent/22 bg-accent/[0.03] p-3.5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="label text-accent-bright">промт</span>
        <span className="type-micro text-dim tabular-nums">{text.length} симв.</span>
      </div>

      {title && (
        <p className="mb-2.5 type-body font-bold tracking-[0.04em]">{title}</p>
      )}

      <p className="type-body tracking-[0.01em] whitespace-pre-wrap text-muted">
        {text}
      </p>

      <CopyButton text={text} label="скопировать промт" full className="mt-3.5" />
    </div>
  )
}
