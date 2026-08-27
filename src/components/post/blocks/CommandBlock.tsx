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
      <div className="flex items-start gap-3 rounded-card border border-accent/18 bg-black/70 p-3">
        <span
          aria-hidden
          className="mt-px shrink-0 type-body font-bold text-accent-bright select-none"
        >
          $
        </span>

        <code className="min-w-0 flex-1 type-body break-words whitespace-pre-wrap text-fg">
          {command}
        </code>

        <CopyButton text={command} />
      </div>

      {note && <p className="mt-2 px-1 type-caption text-dim">{note}</p>}
    </div>
  )
}
