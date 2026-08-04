import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ErrorStateProps {
  title?:       string
  description?: string
  onRetry?:     () => void
  className?:   string
}

export function ErrorState({
  title       = 'Failed to load data',
  description = 'An error occurred while fetching data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-8 text-center',
        className
      )}
    >
      <AlertTriangle size={36} strokeWidth={1.5} className="text-red-500 mb-4" />
      <p className="text-sm font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-xs text-slate-500 max-w-xs mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-2 px-4 py-2 text-xs font-medium
            bg-white border border-slate-300 text-slate-700
            hover:bg-slate-50 hover:text-slate-900
            transition-colors duration-150 cursor-pointer shadow-xs
          "
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  )
}
