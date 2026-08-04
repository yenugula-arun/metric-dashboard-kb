import { cn } from '@/utils/cn'
import type { ActivitySeverity, DeploymentStatus } from '@/types'

type StatusVariant = 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'pending'

interface StatusBadgeProps {
  label:     string
  variant?:  StatusVariant
  /** Show a pulsing dot indicator */
  dot?:      boolean
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  success:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  info:     'bg-blue-50 text-blue-700 border-blue-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  neutral:  'bg-slate-100 text-slate-700 border-slate-200',
}

const dotColors: Record<StatusVariant, string> = {
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  critical: 'bg-red-500',
  info:     'bg-blue-500',
  pending:  'bg-amber-500',
  neutral:  'bg-slate-400',
}

export function StatusBadge({ label, variant = 'neutral', dot = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 shrink-0',
            dotColors[variant],
            variant === 'critical' ? 'animate-pulse' : ''
          )}
        />
      )}
      {label}
    </span>
  )
}

// ─── Convenience mappers ──────────────────────────────────────────────────────

export function deploymentStatusVariant(status: DeploymentStatus): StatusVariant {
  switch (status) {
    case 'running':  return 'success'
    case 'degraded': return 'warning'
    case 'failed':   return 'critical'
    case 'pending':  return 'pending'
    default:         return 'neutral'
  }
}

export function severityVariant(severity: ActivitySeverity): StatusVariant {
  switch (severity) {
    case 'success':  return 'success'
    case 'warning':  return 'warning'
    case 'critical': return 'critical'
    case 'info':     return 'info'
    default:         return 'neutral'
  }
}
