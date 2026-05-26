export function EmptyState({
  emoji = '📭',
  title,
  description,
  action,
}: {
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
