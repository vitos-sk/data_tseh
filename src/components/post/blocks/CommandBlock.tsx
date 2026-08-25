import { CopyButton } from '../CopyButton'

/**
 * Команда командной строки. В отличие от блока кода, здесь строка переносится
 * по словам, а не уезжает в прокрутку: команду перед запуском читают целиком,
 * и спрятанный хвост — прямой путь выполнить не то, что собирался.
 *
 * Знак приглашения нарисован отдельно и в копию не попадает.
 */
export function CommandBlock({ command, note }: { command: string; note?: string }) {
  return (
    <div>
      <div className="flex items-start gap-3 rounded-card border border-red/25 bg-black/70 p-3">
        <span
          aria-hidden
          className="mt-px shrink-0 text-[13px] leading-[1.7] font-bold text-red-bright select-none"
        >
          $
        </span>

        <code className="min-w-0 flex-1 text-[13px] leading-[1.7] break-words whitespace-pre-wrap text-fg">
          {command}
        </code>

        <CopyButton text={command} />
      </div>

      {note && <p className="mt-2 px-1 text-[12.5px] leading-[1.7] text-dim">{note}</p>}
    </div>
  )
}
