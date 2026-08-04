import { cn } from '@/utils/cn'

interface ChartContainerProps {
  title:       string
  subtitle?:   string
  actions?:    React.ReactNode
  children:    React.ReactNode
  height?:     number
  className?:  string
}

/**
 * ChartContainer — consistent wrapper for all chart components.
 * Provides the card border, title bar, and a fixed-height area for the chart.
 * The chart itself (Recharts component) is passed as children.
 */
export function ChartContainer({
  title,
  subtitle,
  actions,
  children,
  height = 220,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 shadow-xs',
        'hover:border-slate-300 transition-colors duration-150',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {/* Chart area */}
      <div className="px-4 py-3" style={{ height }}>
        {children}
      </div>
    </div>
  )
}
