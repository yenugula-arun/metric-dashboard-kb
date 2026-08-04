import { memo } from 'react'
import {
  RefreshCw,
  Layers,
  Server,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ActivityEvent, ActivityEventType, ActivitySeverity } from '@/types'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const eventIcon: Record<ActivityEventType, React.ElementType> = {
  deployment_restarted:     RefreshCw,
  deployment_scaled:        Layers,
  node_unhealthy:           Server,
  pod_crashed:              AlertCircle,
  pod_evicted:              AlertCircle,
  recommendation_created:   Sparkles,
  recommendation_approved:  CheckCircle2,
  recommendation_rejected:  XCircle,
  traffic_spike:            TrendingUp,
  cost_alert:               DollarSign,
  cluster_event:            Activity,
}

// ─── Severity colors ──────────────────────────────────────────────────────────

const severityConfig: Record<ActivitySeverity, {
  dot:    string
  icon:   string
  border: string
  ring:   string
}> = {
  success:  { dot: 'bg-emerald-500', icon: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-50' },
  info:     { dot: 'bg-blue-500',    icon: 'text-blue-600',    border: 'border-blue-200',    ring: 'ring-blue-50' },
  warning:  { dot: 'bg-amber-500',   icon: 'text-amber-600',   border: 'border-amber-200',   ring: 'ring-amber-50' },
  critical: { dot: 'bg-red-500',     icon: 'text-red-600',     border: 'border-red-200',     ring: 'ring-red-50' },
}

// ─── Time formatter ───────────────────────────────────────────────────────────

function formatEventTime(iso: string): { relative: string; absolute: string } {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)

  let relative: string
  if (mins < 1)    relative = 'just now'
  else if (mins < 60)  relative = `${mins}m ago`
  else if (hours < 24) relative = `${hours}h ago`
  else             relative = `${Math.floor(hours / 24)}d ago`

  const absolute = new Date(iso).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return { relative, absolute }
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────

interface TimelineItemProps {
  event:    ActivityEvent
  isLast:   boolean
}

export const TimelineItem = memo(function TimelineItem({
  event,
  isLast,
}: TimelineItemProps) {
  const conf    = severityConfig[event.severity]
  const Icon    = eventIcon[event.type] ?? Activity
  const { relative, absolute } = formatEventTime(event.timestamp)

  return (
    <div className="flex gap-3 group">
      {/* ── Left column: dot + connector line ───────────────────────────── */}
      <div className="flex flex-col items-center shrink-0 w-8">
        {/* Icon badge */}
        <div
          className={cn(
            'flex items-center justify-center w-7 h-7 border ring-4',
            'bg-white shrink-0 z-10',
            conf.border,
            conf.ring,
          )}
        >
          <Icon size={12} className={conf.icon} />
        </div>
        {/* Connector line */}
        {!isLast && (
          <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[24px]" />
        )}
      </div>

      {/* ── Right column: content ────────────────────────────────────────── */}
      <div
        className={cn(
          'flex-1 min-w-0 pb-4',
          isLast ? '' : '',
        )}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Severity dot */}
            <span className={cn(
              'w-1.5 h-1.5 shrink-0 mt-0.5',
              conf.dot,
              event.severity === 'critical' ? 'animate-pulse' : ''
            )} />
            <p className="text-xs font-semibold text-slate-900 truncate">
              {event.title}
            </p>
          </div>
          {/* Timestamp */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-slate-400 whitespace-nowrap">{relative}</span>
            <span className="text-[10px] text-slate-400 font-mono">{absolute}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed pl-3.5">
          {event.description}
        </p>

        {/* Resource + namespace tags */}
        <div className="flex items-center gap-2 mt-2 pl-3.5">
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-50 border border-slate-200 text-slate-600 font-mono">
            {event.namespace}
          </span>
          <span className="text-[10px] text-slate-300">·</span>
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
            {event.resource}
          </span>
        </div>
      </div>
    </div>
  )
})
