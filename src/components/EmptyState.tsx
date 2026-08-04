import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  title?:       string
  description?: string
  icon?:        React.ReactNode
  action?:      React.ReactNode
  className?:   string
}

export function EmptyState({
  title       = 'No data available',
  description = 'There is nothing to display here yet.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className
      )}
    >
      <div className="text-slate-400 mb-4">
        {icon ?? <Inbox size={40} strokeWidth={1} />}
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-500 max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
