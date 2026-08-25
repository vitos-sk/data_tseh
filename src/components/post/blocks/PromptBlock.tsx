import { CopyButton } from '../CopyButton'

/**
 * Промт для нейросети. Шрифт в интерфейсе один на всё, поэтому от блока кода
 * промт отличается вёрсткой: широкий межстрочный интервал прозы, перенос по
 * словам и копирование во всю ширину — здесь это главное действие, а не
 * мелкая кнопка в углу.
 */
export function PromptBlock({ text, title }: { text: string; title?: string }) {
  return (
    <div className="rounded-card border border-red/30 bg-red/[0.04] p-3.5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="label text-red-bright">промт</span>
        <span className="text-[11px] text-dim tabular-nums">{text.length} симв.</span>
      </div>

      {title && (
        <p className="mb-2.5 text-[13.5px] leading-snug font-bold tracking-[0.04em]">{title}</p>
      )}

      <p className="text-[13.5px] leading-[1.8] tracking-[0.01em] whitespace-pre-wrap text-muted">
        {text}
      </p>

      <CopyButton text={text} label="скопировать промт" full className="mt-3.5" />
    </div>
  )
}
