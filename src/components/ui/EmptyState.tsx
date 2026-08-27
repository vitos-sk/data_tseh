interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  text: string
  action?: React.ReactNode
}

/** Пустое состояние: квадрат со стеклом, строчный заголовок, тихое описание. */
export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="glass mb-5 flex size-14 items-center justify-center rounded-card text-accent">
        {icon}
      </div>
      <h3 className="mb-2.5 text-[17px] font-bold tracking-[0.12em] lowercase">{title}</h3>
      <p className="max-w-[300px] text-[13.5px] leading-[1.7] text-dim">{text}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}
