interface SectionHeaderProps {
  title: string
  action?: { label: string; onClick: () => void }
}

/**
 * Заголовок секции. Принудительно строчный и с широким трекингом:
 * контраст к капсовым меткам держит весь тон интерфейса.
 */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-3 px-5">
      <h2 className="type-section font-bold tracking-[0.25em] lowercase">
        <span className="mr-2 text-accent">/</span>
        {title}
      </h2>
      {action && (
        <button type="button" onClick={action.onClick} className="press label text-accent-bright">
          {action.label}
        </button>
      )}
    </div>
  )
}
