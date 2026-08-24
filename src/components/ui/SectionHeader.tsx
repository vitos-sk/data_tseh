interface SectionHeaderProps {
  title: string
  action?: { label: string; onClick: () => void }
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-5">
      <h2 className="text-[22px] leading-tight font-bold tracking-[-0.02em]">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="press text-[15px] font-medium text-gold"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
