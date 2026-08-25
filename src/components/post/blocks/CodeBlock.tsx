import { CopyButton } from '../CopyButton'

/**
 * Код с копированием. Прокрутка живёт внутри блока: длинная строка не должна
 * растягивать страницу — иначе весь пост начинает ездить вбок.
 */
export function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-black/60">
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-black/40 py-2 pr-2 pl-3.5">
        <span className="label text-dim">{lang || 'код'}</span>
        <CopyButton text={code} />
      </div>

      <pre className="scroll-x-clean p-4">
        <code className="text-[12.5px] leading-[1.75] whitespace-pre text-fg">{code}</code>
      </pre>
    </div>
  )
}
