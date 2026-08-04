import { memo } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  XCircle,
  Cpu,
  MemoryStick,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  AlertTriangle,
  Shield,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { AIRecommendation } from '@/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecommendationCardProps {
  recommendation:  AIRecommendation
  /** From deployments data, passed in by parent — no direct service calls here */
  cpuUsage?:       string
  memoryUsage?:    string
  cpuPercent?:     number
  memoryPercent?:  number
  requestsPerSec?: number
  onApprove:       (id: string) => void
  onReject:        (id: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const confidenceConfig = {
  high:   { label: 'High Confidence',   color: '#16a34a', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Shield },
  medium: { label: 'Needs Review',      color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
  low:    { label: 'Low Confidence',    color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle },
} as const

const statusConfig = {
  pending:   { label: 'Pending',   bg: 'bg-blue-50', text: 'text-blue-700' },
  approved:  { label: 'Approved',  bg: 'bg-emerald-50', text: 'text-emerald-700' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-50', text: 'text-red-700' },
  executing: { label: 'Executing', bg: 'bg-amber-50', text: 'text-amber-700' },
  done:      { label: 'Done',      bg: 'bg-slate-100', text: 'text-slate-600' },
} as const

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatSavings(usd: number): { label: string; positive: boolean } {
  if (usd >= 0) return { label: `$${usd}/mo`, positive: true }
  return { label: `+$${Math.abs(usd)}/mo cost`, positive: false }
}

// ─── Mini progress bar ────────────────────────────────────────────────────────

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1 bg-slate-100">
      <div
        className="h-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ─── Replica Delta Badge ──────────────────────────────────────────────────────

function ReplicaDelta({ current, recommended }: { current: number; recommended: number }) {
  const delta = recommended - current
  const isUp  = delta > 0

  return (
    <div className="flex items-center gap-3">
      {/* Current */}
      <div className="text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Current</p>
        <div className="flex items-center justify-center w-9 h-9 bg-slate-50 border border-slate-200">
          <span className="text-base font-bold text-slate-800 tabular-nums">{current}</span>
        </div>
      </div>

      {/* Arrow + delta */}
      <div className="flex flex-col items-center gap-0.5">
        {isUp
          ? <ArrowUp size={14} className="text-amber-600" />
          : <ArrowDown size={14} className="text-emerald-600" />
        }
        <span className={cn('text-[10px] font-semibold tabular-nums', isUp ? 'text-amber-600' : 'text-emerald-600')}>
          {isUp ? `+${delta}` : delta}
        </span>
      </div>

      {/* Recommended */}
      <div className="text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Target</p>
        <div className={cn(
          'flex items-center justify-center w-9 h-9 border',
          isUp
            ? 'bg-amber-50 border-amber-200'
            : 'bg-emerald-50 border-emerald-200'
        )}>
          <span className={cn('text-base font-bold tabular-nums', isUp ? 'text-amber-700' : 'text-emerald-700')}>
            {recommended}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── RecommendationCard ───────────────────────────────────────────────────────

export const RecommendationCard = memo(function RecommendationCard({
  recommendation: rec,
  cpuUsage,
  memoryUsage,
  cpuPercent,
  memoryPercent,
  requestsPerSec,
  onApprove,
  onReject,
}: RecommendationCardProps) {
  const conf    = confidenceConfig[rec.confidence]
  const status  = statusConfig[rec.status]
  const savings = formatSavings(rec.estimatedSavingsUSD)
  const isPending = rec.status === 'pending'
  const ConfIcon = conf.icon
  const isScaleUp = rec.recommendedReplicas > rec.currentReplicas

  return (
    <article
      className={cn(
        'bg-white border border-slate-200 shadow-xs flex flex-col',
        'hover:border-slate-300 transition-all duration-150',
        'animate-fade-in',
        // Left accent bar color per confidence
        rec.confidence === 'high'   && 'border-l-4 border-l-emerald-500',
        rec.confidence === 'medium' && 'border-l-4 border-l-amber-500',
        rec.confidence === 'low'    && 'border-l-4 border-l-red-500',
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="min-w-0 flex-1 mr-2">
          {/* Service name */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-5 h-5 bg-blue-50 border border-blue-100">
              <Zap size={10} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-slate-900 truncate">{rec.serviceName}</span>
          </div>
          {/* Namespace */}
          <span className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-50 border border-slate-200 text-slate-600 font-mono">
            {rec.namespace}
          </span>
        </div>

        {/* Confidence chip + status */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={cn('flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border', conf.bg, conf.border, conf.text)}>
            <ConfIcon size={9} />
            <span>{rec.confidenceScore}%</span>
          </div>
          <span className={cn('px-1.5 py-0.5 text-[10px] font-medium', status.bg, status.text)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Replica Delta ───────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-slate-100">
        <ReplicaDelta
          current={rec.currentReplicas}
          recommended={rec.recommendedReplicas}
        />
      </div>

      {/* ── Resource Metrics ────────────────────────────────────────────── */}
      {(cpuUsage ?? memoryUsage ?? requestsPerSec !== undefined) && (
        <div className="px-4 py-3 border-b border-slate-100 space-y-2.5">
          {cpuUsage !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu size={10} className="text-blue-600" />
                  <span className="text-[10px] text-slate-500">CPU</span>
                </div>
                <span className="text-[10px] font-mono text-slate-700">{cpuUsage}</span>
              </div>
              {cpuPercent !== undefined && <MiniBar value={cpuPercent} color="#2563eb" />}
            </div>
          )}
          {memoryUsage !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MemoryStick size={10} className="text-purple-600" />
                  <span className="text-[10px] text-slate-500">Memory</span>
                </div>
                <span className="text-[10px] font-mono text-slate-700">{memoryUsage}</span>
              </div>
              {memoryPercent !== undefined && <MiniBar value={memoryPercent} color="#9333ea" />}
            </div>
          )}
          {requestsPerSec !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isScaleUp
                  ? <TrendingUp size={10} className="text-amber-600" />
                  : <TrendingDown size={10} className="text-emerald-600" />
                }
                <span className="text-[10px] text-slate-500">Traffic</span>
              </div>
              <span className="text-[10px] font-mono text-slate-700">{requestsPerSec} req/s</span>
            </div>
          )}
        </div>
      )}

      {/* ── Reason ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 flex-1 border-b border-slate-100">
        <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 font-medium">AI Reasoning</p>
        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{rec.reason}</p>
      </div>

      {/* ── Footer: Savings + Timestamp ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {savings.positive
            ? <TrendingDown size={11} className="text-emerald-600" />
            : <TrendingUp   size={11} className="text-amber-600" />
          }
          <span className={cn('text-xs font-semibold', savings.positive ? 'text-emerald-600' : 'text-amber-600')}>
            {savings.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock size={9} />
          {formatRelativeTime(rec.createdAt)}
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────────── */}
      <div className="flex gap-0 border-t border-slate-100">
        {isPending ? (
          <>
            <button
              id={`reject-${rec.id}`}
              onClick={() => onReject(rec.id)}
              className="
                flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                text-slate-600 hover:bg-red-50 hover:text-red-600
                border-r border-slate-100 transition-colors duration-100 cursor-pointer
              "
            >
              <XCircle size={12} />
              Reject
            </button>
            <button
              id={`approve-${rec.id}`}
              onClick={() => onApprove(rec.id)}
              className="
                flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                text-emerald-600 hover:bg-emerald-50
                transition-colors duration-100 cursor-pointer
              "
            >
              <CheckCircle size={12} />
              Approve
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-2.5">
            <span className={cn('text-xs font-medium', status.text)}>{status.label}</span>
          </div>
        )}
      </div>
    </article>
  )
})
