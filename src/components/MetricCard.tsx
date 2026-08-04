import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'neutral'
type CardVariant    = 'default' | 'success' | 'warning' | 'critical' | 'info'

interface MetricCardProps {
  title:          string
  value:          string | number
  unit?:          string
  subtitle?:      string
  icon:           LucideIcon
  trend?:         TrendDirection
  trendValue?:    string
  variant?:       CardVariant
  /** 0–100 progress bar */
  progress?:      number
  className?:     string
}

const variantIcon: Record<CardVariant, string> = {
  default:  'text-blue-600 bg-blue-50 border border-blue-100',
  success:  'text-emerald-600 bg-emerald-50 border border-emerald-100',
  warning:  'text-amber-600 bg-amber-50 border border-amber-100',
  critical: 'text-red-600 bg-red-50 border border-red-100',
  info:     'text-cyan-600 bg-cyan-50 border border-cyan-100',
}

const variantProgress: Record<CardVariant, string> = {
  default:  'bg-blue-600',
  success:  'bg-emerald-600',
  warning:  'bg-amber-500',
  critical: 'bg-red-600',
  info:     'bg-cyan-600',
}

const trendColors: Record<TrendDirection, string> = {
  up:      'text-emerald-600',
  down:    'text-red-600',
  neutral: 'text-slate-500',
}

const TrendIcon = ({ dir }: { dir: TrendDirection }) => {
  if (dir === 'up')   return <TrendingUp size={11} />
  if (dir === 'down') return <TrendingDown size={11} />
  return <Minus size={11} />
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  progress,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 p-4 shadow-xs',
        'hover:border-slate-300 transition-colors duration-150',
        'animate-fade-in',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('flex items-center justify-center w-8 h-8', variantIcon[variant])}>
          <Icon size={15} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-semibold text-slate-900 leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-slate-500">{unit}</span>
        )}
      </div>

      {/* Subtitle / trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-xs text-slate-500">{subtitle}</span>
        )}
        {trend && trendValue && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', trendColors[trend])}>
            <TrendIcon dir={trend} />
            {trendValue}
          </span>
        )}
      </div>

      {/* Optional progress bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-slate-100">
          <div
            className={cn('h-full transition-[width] duration-500', variantProgress[variant])}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}
