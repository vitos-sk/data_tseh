interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  text: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-surface text-muted">
        {icon}
      </div>
      <h3 className="mb-2 text-[19px] font-bold">{title}</h3>
      <p className="max-w-[280px] text-[15px] leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
