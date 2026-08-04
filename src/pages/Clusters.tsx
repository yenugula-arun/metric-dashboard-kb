import { useState, useMemo, useCallback } from 'react'
import { useNavigate }                      from 'react-router-dom'
import {
  Server,
  Search,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Activity,
  Globe,
  Hash,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

import { useAWSContext }    from '@/context/AWSContext'
import { StatCard }         from '@/components/StatCard'
import { Pagination }       from '@/components/Pagination'
import { StatusBadge }      from '@/components/StatusBadge'
import { MetricCardSkeleton, Skeleton } from '@/components/LoadingSkeleton'
import { ErrorState }       from '@/components/ErrorState'
import { EmptyState }       from '@/components/EmptyState'
import { Section }          from '@/layouts/Section'
import { cn }               from '@/utils/cn'
import type { EKSCluster, EKSClusterStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

type SortField = 'name' | 'region' | 'status'
type SortDir   = 'asc' | 'desc'

const STATUS_OPTIONS: { value: EKSClusterStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'All statuses' },
  { value: 'ACTIVE',   label: 'Active'   },
  { value: 'CREATING', label: 'Creating' },
  { value: 'UPDATING', label: 'Updating' },
  { value: 'DELETING', label: 'Deleting' },
  { value: 'FAILED',   label: 'Failed'   },
  { value: 'PENDING',  label: 'Pending'  },
]

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

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) {
    return <ChevronUp size={12} className="text-slate-300" />
  }
  return dir === 'asc'
    ? <ChevronUp   size={12} className="text-blue-600" />
    : <ChevronDown size={12} className="text-blue-600" />
}

export default function ClustersPage() {
  const { roleArn, connection, loading, error, disconnect, refresh } = useAWSContext()
  const navigate = useNavigate()

  // ── Table state ───────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<EKSClusterStatus | 'ALL'>('ALL')
  const [sortField,    setSortField]    = useState<SortField>('name')
  const [sortDir,      setSortDir]      = useState<SortDir>('asc')
  const [currentPage,  setCurrentPage]  = useState(1)

  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir('asc')
      return field
    })
    setCurrentPage(1)
  }, [])

  const filtered = useMemo(() => {
    const allClusters = connection?.clusters ?? []
    const q = search.trim().toLowerCase()

    return allClusters
      .filter((c) => {
        const matchesSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)

        const matchesStatus =
          statusFilter === 'ALL' || c.status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const aVal = a[sortField].toLowerCase()
        const bVal = b[sortField].toLowerCase()
        const cmp  = aVal.localeCompare(bVal)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [connection, search, statusFilter, sortField, sortDir])

  const handleSearch = useCallback((v: string) => {
    setSearch(v)
    setCurrentPage(1)
  }, [])

  const handleStatusFilter = useCallback((v: EKSClusterStatus | 'ALL') => {
    setStatusFilter(v)
    setCurrentPage(1)
  }, [])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const stats = useMemo(() => {
    const clusters = connection?.clusters ?? []
    const active   = clusters.filter((c) => c.status === 'ACTIVE').length
    const inactive = clusters.length - active
    const regions  = new Set(clusters.map((c) => c.region)).size
    return { total: clusters.length, active, inactive, regions }
  }, [connection])

  const Th = ({
    field,
    label,
    className,
  }: {
    field:      SortField
    label:      string
    className?: string
  }) => (
    <th
      className={cn(
        'px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide',
        'cursor-pointer select-none hover:text-slate-800 transition-colors duration-100',
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} active={sortField} dir={sortDir} />
      </div>
    </th>
  )

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">EKS Clusters</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {connection
              ? `Connected AWS Account ${connection.accountId} · ${stats.total} clusters discovered`
              : 'Discovering EKS clusters…'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {connection && (
            <button
              onClick={disconnect}
              className="
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-red-600
                transition-colors cursor-pointer shrink-0
              "
            >
              <LogOut size={13} />
              Switch AWS Account
            </button>
          )}

          <button
            onClick={refresh}
            className="
              flex items-center gap-2 px-3 py-1.5 text-xs font-medium
              border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900
              transition-colors cursor-pointer shrink-0
            "
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connected Account Banner */}
      {connection && (
        <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Active AWS Role ARN</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5">
                  Account: {connection.accountId}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 truncate max-w-xl" title={roleArn}>
                {roleArn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Summary */}
      <Section title="Account Summary" description="Aggregate view of discovered EKS clusters">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refresh} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <StatCard
              label="Total Clusters"
              value={stats.total}
              icon={Server}
              variant="info"
            />
            <StatCard
              label="Active"
              value={stats.active}
              icon={CheckCircle2}
              variant="success"
              sub={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
            />
            <StatCard
              label="Inactive / Issues"
              value={stats.inactive}
              icon={AlertCircle}
              variant={stats.inactive > 0 ? 'warning' : 'default'}
              sub={stats.inactive === 0 ? 'All healthy' : 'Needs attention'}
            />
            <StatCard
              label="Regions"
              value={stats.regions}
              icon={Globe}
              variant="default"
              sub="AWS regions"
            />
            <StatCard
              label="AWS Account ID"
              value={connection?.accountId ?? '—'}
              icon={Hash}
              variant="default"
            />
          </div>
        )}
      </Section>

      {/* Cluster Table */}
      <Section
        title="Discovered Clusters"
        description={
          filtered.length !== (connection?.clusters?.length ?? 0)
            ? `${filtered.length} of ${connection?.clusters?.length ?? 0} clusters match filters`
            : `${stats.total} clusters discovered`
        }
      >
        {error ? (
          <ErrorState description={error} onRetry={refresh} />
        ) : (
          <div className="bg-white border border-slate-200">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by cluster name, region, status…"
                  className="
                    w-full pl-8 pr-3 py-1.5 text-xs
                    border border-slate-200 bg-white
                    text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:ring-1 focus:ring-blue-600
                  "
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as EKSClusterStatus | 'ALL')}
                className="
                  px-2.5 py-1.5 text-xs
                  border border-slate-200 bg-white text-slate-700
                  focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer
                "
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <span className="text-xs text-slate-400 ml-auto shrink-0">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No clusters found"
                description={
                  search || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No EKS clusters were returned for this AWS account.'
                }
                icon={<Server size={40} strokeWidth={1} className="text-slate-300" />}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <Th field="name"   label="Cluster Name" className="pl-5" />
                        <Th field="region" label="Region" />
                        <Th field="status" label="Status" />
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          ARN
                        </th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginated.map((cluster) => (
                        <ClusterRow
                          key={cluster.name}
                          cluster={cluster}
                          onNavigate={() => navigate(`/clusters/${cluster.name}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-200 px-4">
                  <Pagination
                    totalItems={filtered.length}
                    pageSize={PAGE_SIZE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Section>
    </div>
  )
}

function ClusterRow({ cluster, onNavigate }: { cluster: EKSCluster; onNavigate: () => void }) {
  return (
    <tr
      onClick={onNavigate}
      className="
        group cursor-pointer
        hover:bg-blue-50 hover:border-l-2 hover:border-l-blue-600
        transition-colors duration-100
      "
    >
      <td className="px-4 pl-5 py-3">
        <div className="flex items-center gap-2.5">
          <Activity
            size={14}
            className="text-slate-300 group-hover:text-blue-500 transition-colors duration-100 shrink-0"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate() }}
            className="
              text-sm font-semibold text-blue-600
              hover:text-blue-800 hover:underline
              transition-colors duration-100 text-left
            "
          >
            {cluster.name}
          </button>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
          {cluster.region}
        </span>
      </td>

      <td className="px-4 py-3">
        <StatusBadge
          label={cluster.status}
          variant={clusterStatusVariant(cluster.status)}
          dot
        />
      </td>

      <td className="px-4 py-3 max-w-[320px]">
        <span
          className="text-[11px] font-mono text-slate-400 truncate block"
          title={cluster.arn}
        >
          {cluster.arn}
        </span>
      </td>

      <td className="px-4 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate() }}
          className="
            text-xs font-medium text-blue-600 border border-blue-200
            px-2.5 py-1 hover:bg-blue-600 hover:text-white
            transition-colors duration-100 cursor-pointer
          "
        >
          View Details
        </button>
      </td>
    </tr>
  )
}
