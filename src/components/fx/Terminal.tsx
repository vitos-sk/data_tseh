import { cn } from '@/lib/cn'

interface TerminalProps {
  lines: string[]
  /** Мигающий блок в конце последней строки — признак живого приглашения. */
  caret?: boolean
  className?: string
}

/** Моноблок со стеклом: служебные строки, статусы, пустые состояния. */
export function Terminal({ lines, caret = true, className }: TerminalProps) {
  return (
    <div className={cn('glass rounded-card px-3.5 py-3', className)}>
      {lines.map((line, i) => (
        <p key={i} className="text-[12.5px] leading-[1.7] tracking-[0.02em] text-dim">
          <span className="mr-1.5 text-accent-bright">&gt;</span>
          {line}
          {caret && i === lines.length - 1 && <span className="caret ml-1.5" />}
        </p>
      ))}
    </div>
  )
}
