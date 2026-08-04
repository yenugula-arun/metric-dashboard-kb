import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label:      string
  value:      string | number
  icon?:      LucideIcon
  /** Optional sub-label beneath the value */
  sub?:       string
  /** Visual accent variant */
  variant?:   'default' | 'success' | 'warning' | 'critical' | 'info'
  className?: string
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default:  'text-slate-800',
  success:  'text-emerald-700',
  warning:  'text-amber-700',
  critical: 'text-red-700',
  info:     'text-blue-700',
}

const iconBg: Record<NonNullable<StatCardProps['variant']>, string> = {
  default:  'bg-slate-100 text-slate-500',
  success:  'bg-emerald-50 text-emerald-600',
  warning:  'bg-amber-50 text-amber-600',
  critical: 'bg-red-50 text-red-600',
  info:     'bg-blue-50 text-blue-600',
}

/**
 * StatCard — single-responsibility summary card.
 * Used at the top of list/overview pages to display aggregate counts.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  variant = 'default',
  className,
}: StatCardProps) {
  const valStr = String(value)
  const isLong = valStr.length > 8

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 px-4 py-4 flex flex-col justify-between gap-2 min-w-0 overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
          {label}
        </span>
        {Icon && (
          <div className={cn('flex items-center justify-center w-7 h-7 shrink-0', iconBg[variant])}>
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            'font-semibold tabular-nums leading-none truncate',
            isLong ? 'text-lg md:text-xl' : 'text-2xl',
            variantStyles[variant]
          )}
          title={valStr}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 mt-1 truncate" title={sub}>{sub}</p>
        )}
      </div>
    </div>
  )
}
