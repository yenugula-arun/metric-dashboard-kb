import { useNavigate } from 'react-router-dom'
import {
  Server,
  Globe,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Activity,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

import { useAWSContext }  from '@/context/AWSContext'
import { ErrorState }      from '@/components/ErrorState'
import { Skeleton }        from '@/components/LoadingSkeleton'
import { StatusBadge }     from '@/components/StatusBadge'
import { ROUTES }          from '@/constants/routes'
import { cn }              from '@/utils/cn'
import type { EKSCluster, EKSClusterStatus } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clusterStatusVariant(
  status: EKSClusterStatus
): 'success' | 'warning' | 'critical' | 'info' | 'neutral' {
  switch (status) {
    case 'ACTIVE':   return 'success'
    case 'CREATING': return 'info'
    case 'UPDATING': return 'warning'
    case 'DELETING': return 'warning'
    case 'FAILED':   return 'critical'
    case 'PENDING':  return 'neutral'
  }
}

/** Summary stat chip */
function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon:   React.ComponentType<{ size?: number; className?: string }>
  label:  string
  value:  string | number
  sub?:   string
  accent?: 'green' | 'amber' | 'red' | 'blue' | 'default'
}) {
  const valueColor =
    accent === 'green'   ? 'text-emerald-700' :
    accent === 'amber'   ? 'text-amber-700'   :
    accent === 'red'     ? 'text-red-700'     :
    accent === 'blue'    ? 'text-blue-700'    :
    'text-slate-900'

  return (
    <div className="bg-white border border-slate-200 px-5 py-4 flex items-start gap-4">
      <div className="w-9 h-9 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
        <p className={cn('text-2xl font-bold leading-tight mt-0.5', valueColor)}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/** A single cluster row in the recent list */
function ClusterRow({ cluster, onClick }: { cluster: EKSCluster; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-blue-50 transition-colors group"
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Activity size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="text-sm font-semibold text-blue-600 hover:underline text-left truncate max-w-[240px]"
          >
            {cluster.name}
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5">
          {cluster.region}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge label={cluster.status} variant={clusterStatusVariant(cluster.status)} dot />
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors inline-block" />
      </td>
    </tr>
  )
}

export default function DashboardPage() {
  const { connection, roleArn, loading, error, disconnect, refresh } = useAWSContext()
  const navigate = useNavigate()

  const clusters = connection?.clusters ?? []

  const total    = clusters.length
  const active   = clusters.filter(c => c.status === 'ACTIVE').length
  const failed   = clusters.filter(c => c.status === 'FAILED').length
  const updating = clusters.filter(c => c.status === 'UPDATING' || c.status === 'CREATING').length
  const regions  = new Set(clusters.map(c => c.region)).size

  const recentClusters = clusters.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {connection
              ? `AWS Account ${connection.accountId} · ${total} cluster${total !== 1 ? 's' : ''} discovered`
              : 'Connecting to AWS…'}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {error && <ErrorState description={error} onRetry={refresh} />}

      {/* Summary Cards */}
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-3">
          Account Summary
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 px-5 py-4 h-24">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-7 w-10 mb-1" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            ))
          ) : (
            <>
              <SummaryCard icon={Server}       label="Total Clusters" value={total} accent="blue" />
              <SummaryCard icon={CheckCircle2} label="Active"         value={active}
                sub={`${total > 0 ? Math.round((active / total) * 100) : 0}% of total`}
                accent="green"
              />
              <SummaryCard icon={AlertCircle}  label="Updating / Creating" value={updating}
                accent={updating > 0 ? 'amber' : 'default'}
              />
              <SummaryCard icon={XCircle}      label="Failed" value={failed}
                accent={failed > 0 ? 'red' : 'default'}
                sub={failed === 0 ? 'All healthy' : 'Needs attention'}
              />
              <SummaryCard icon={Globe}        label="Regions" value={regions} sub="AWS regions" />
            </>
          )}
        </div>
      </div>

      {/* AWS Account Connection Info */}
      {!loading && connection && (
        <div className="bg-white border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900">AWS Role ARN Connected</h3>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5">
                  Account: {connection.accountId}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 truncate max-w-lg" title={roleArn}>
                {roleArn}
              </p>
            </div>
          </div>

          <button
            onClick={disconnect}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={13} />
            Switch AWS Account
          </button>
        </div>
      )}

      {/* Recent Clusters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">
            Recent Clusters
          </p>
          <button
            onClick={() => navigate(ROUTES.CLUSTERS)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
          >
            View all clusters →
          </button>
        </div>

        <div className="bg-white border border-slate-200">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentClusters.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Server size={32} strokeWidth={1} className="mx-auto mb-3 text-slate-300" />
              <p>No clusters discovered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Region</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentClusters.map(c => (
                    <ClusterRow
                      key={c.name}
                      cluster={c}
                      onClick={() => navigate(`/clusters/${c.name}`)}
                    />
                  ))}
                </tbody>
              </table>
              {clusters.length > 5 && (
                <div className="border-t border-slate-100 px-5 py-3">
                  <button
                    onClick={() => navigate(ROUTES.CLUSTERS)}
                    className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                  >
                    + {clusters.length - 5} more clusters — view all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      {!loading && clusters.length > 0 && (
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-3">
            Cluster Status Breakdown
          </p>
          <div className="bg-white border border-slate-200 p-5">
            <div className="space-y-3">
              {(['ACTIVE', 'UPDATING', 'CREATING', 'FAILED', 'DELETING', 'PENDING'] as EKSClusterStatus[]).map(status => {
                const count = clusters.filter(c => c.status === status).length
                if (count === 0) return null
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={status} className="flex items-center gap-3">
                    <StatusBadge label={status} variant={clusterStatusVariant(status)} dot />
                    <div className="flex-1 h-2 bg-slate-100">
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          status === 'ACTIVE'   ? 'bg-emerald-500' :
                          status === 'FAILED'   ? 'bg-red-400'     :
                          status === 'DELETING' ? 'bg-red-300'     :
                          'bg-amber-400'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-600 w-24 text-right shrink-0">
                      {count} cluster{count !== 1 ? 's' : ''} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
