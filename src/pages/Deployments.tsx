import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Database,
  Box,
  X,
  Activity,
  ArrowUpRight,
  Clock,
  RotateCcw,
} from 'lucide-react'

import { useAWSContext }      from '@/context/AWSContext'
import { useDeployments }     from '@/hooks/useDeployments'
import { Breadcrumb }         from '@/components/Breadcrumb'
import { StatusBadge }        from '@/components/StatusBadge'
import { ErrorState }         from '@/components/ErrorState'
import { Skeleton }           from '@/components/LoadingSkeleton'
import { EmptyState }         from '@/components/EmptyState'
import { ROUTES }             from '@/constants/routes'
import { cn }                 from '@/utils/cn'
import type { DeploymentRow, DeploymentStatus } from '@/types'

// ─── Helpers & Formatters ───────────────────────────────────────────────────

function deploymentStatusVariant(
  status: DeploymentStatus
): 'success' | 'warning' | 'critical' | 'info' | 'neutral' {
  switch (status) {
    case 'running':  return 'success'
    case 'degraded': return 'warning'
    case 'failed':   return 'critical'
    case 'pending':  return 'neutral'
    default:         return 'neutral'
  }
}

/** Formats CPU millicores string (e.g. "320m") to millicores & vCPU */
function formatCpuString(cpuStr: string): { formatted: string; vCpu: string } {
  const numeric = parseInt(cpuStr.replace(/[^0-9]/g, ''), 10) || 0
  const vCpuVal = numeric / 1000
  return {
    formatted: `${numeric}m`,
    vCpu: `${vCpuVal.toFixed(2)} vCPU`,
  }
}

/** Formats Memory string (e.g. "512Mi") to MiB & GiB */
function formatMemoryString(memStr: string): { formatted: string; converted: string } {
  const numeric = parseInt(memStr.replace(/[^0-9]/g, ''), 10) || 0
  const gibVal = numeric / 1024
  return {
    formatted: `${numeric} MiB`,
    converted: `${gibVal.toFixed(2)} GiB`,
  }
}

function getPercentColor(pct: number): string {
  if (pct >= 85) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  if (pct >= 35) return 'bg-blue-500'
  return 'bg-emerald-500'
}

function KpiCard({
  title, value, subtitle, icon: Icon, colorClass, bgClass, borderClass
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  colorClass: string
  bgClass: string
  borderClass: string
}) {
  return (
    <div className={cn('p-4 border space-y-1 transition-all', bgClass, borderClass)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</span>
        <Icon size={16} className={colorClass} />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
      <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
    </div>
  )
}

// ─── Detail Drawer Component ─────────────────────────────────────────────────

function DeploymentDetailDrawer({
  deployment,
  onClose,
}: {
  deployment: DeploymentRow
  onClose: () => void
}) {
  const cpuFormat = formatCpuString(deployment.cpuUsage)
  const memFormat = formatMemoryString(deployment.memoryUsage)
  const replicaPct = deployment.replicas > 0 ? (deployment.availableReplicas / deployment.replicas) * 100 : 0

  const drawerBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Lock background page scroll while drawer is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Reset drawer inner scroll position to top
    if (drawerBodyRef.current) {
      drawerBodyRef.current.scrollTop = 0
    }

    const timer = setTimeout(() => {
      if (drawerBodyRef.current) {
        drawerBodyRef.current.scrollTop = 0
      }
    }, 10)

    return () => {
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
    }
  }, [deployment])

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Background Dimmed Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Card Panel */}
      <div className="relative z-10 w-full max-w-xl bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {deployment.namespace}
              </span>
              <StatusBadge
                label={deployment.status}
                variant={deploymentStatusVariant(deployment.status)}
                dot
              />
            </div>
            <h2 className="text-xl font-bold font-mono text-slate-900">{deployment.name}</h2>
            <p className="text-xs font-mono text-slate-400">ID: {deployment.id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div ref={drawerBodyRef} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Replica Status Gauge */}
          <div className="p-4 border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Box size={14} className="text-blue-600" /> Replicas Availability
              </span>
              <span className="font-mono font-bold text-slate-900">
                {deployment.availableReplicas} / {deployment.replicas} Active
              </span>
            </div>
            <div className="h-3 bg-slate-100 border border-slate-200 overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', replicaPct === 100 ? 'bg-emerald-500' : replicaPct > 0 ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${replicaPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {replicaPct === 100
                ? 'All pod replicas are healthy and ready to process incoming requests.'
                : `${deployment.replicas - deployment.availableReplicas} pod replica(s) are failing or pending startup.`}
            </p>
          </div>

          {/* Resource Usage Gauges */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Resource Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* CPU */}
              <div className="p-4 border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                    <Cpu size={14} className="text-blue-600" /> CPU Usage
                  </span>
                  <span className="font-mono font-bold text-blue-700">{cpuFormat.formatted}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">{cpuFormat.vCpu}</span>
                  <span className="font-bold text-slate-900">{deployment.cpuPercent}% load</span>
                </div>
                <div className="h-2 bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500', getPercentColor(deployment.cpuPercent))}
                    style={{ width: `${deployment.cpuPercent}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div className="p-4 border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                    <Database size={14} className="text-violet-600" /> Memory Usage
                  </span>
                  <span className="font-mono font-bold text-violet-700">{memFormat.formatted}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">{memFormat.converted}</span>
                  <span className="font-bold text-slate-900">{deployment.memoryPercent}% load</span>
                </div>
                <div className="h-2 bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500', getPercentColor(deployment.memoryPercent))}
                    style={{ width: `${deployment.memoryPercent}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operational Details</h4>
            <div className="bg-slate-50 border border-slate-200 p-4 divide-y divide-slate-200/80 text-xs">

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Activity size={13} className="text-slate-400" /> Network Throughput
                </span>
                <span className="font-mono font-bold text-slate-900">{deployment.requestsPerSec} req/sec</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <RotateCcw size={13} className="text-slate-400" /> Container Restarts (K8s)
                </span>
                <span className={cn(
                  'font-mono font-bold px-2 py-0.5 border text-[11px]',
                  (deployment.restartCount || 0) > 3
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : (deployment.restartCount || 0) > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                )}>
                  {deployment.restartCount || 0} restarts
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" /> Last Updated
                </span>
                <span className="font-mono text-slate-700">
                  {new Date(deployment.lastUpdated).toLocaleString()}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}

// ─── Main Deployments Page Component ─────────────────────────────────────────

export default function DeploymentsPage() {
  const { roleArn, connection } = useAWSContext()
  const activeClusterName       = connection?.clusters?.[0]?.name ?? ''

  const { data, loading, error, refresh } = useDeployments(activeClusterName, roleArn)

  const [searchQuery, setSearchQuery]       = useState('')
  const [namespaceFilter, setNamespaceFilter] = useState('ALL')
  const [statusFilter, setStatusFilter]       = useState('ALL')

  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRow | null>(null)

  const breadcrumbs = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'Deployments' },
  ]

  const filteredDeployments = useMemo(() => {
    const deps = data?.deployments ?? []
    const q = searchQuery.trim().toLowerCase()

    return deps.filter((d) => {
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.namespace.toLowerCase().includes(q)

      const matchesNs = namespaceFilter === 'ALL' || d.namespace === namespaceFilter
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter

      return matchesSearch && matchesNs && matchesStatus
    })
  }, [data, searchQuery, namespaceFilter, statusFilter])

  return (
    <div className="space-y-6 animate-fade-in">

      <Breadcrumb items={breadcrumbs} />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Kubernetes Deployments</h1>
            {connection?.accountId && (
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 font-semibold">
                Account: {connection.accountId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workload deployment monitoring, replica health, and resource utilization across cluster namespaces.
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          title="Deployments"
          value={loading ? '…' : data?.summary.total ?? 0}
          subtitle="Total workloads"
          icon={Layers}
          colorClass="text-blue-600"
          bgClass="bg-white"
          borderClass="border-slate-200"
        />
        <KpiCard
          title="Healthy Running"
          value={loading ? '…' : data?.summary.running ?? 0}
          subtitle="All replicas active"
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50/40"
          borderClass="border-emerald-200"
        />
        <KpiCard
          title="Degraded"
          value={loading ? '…' : data?.summary.degraded ?? 0}
          subtitle="Partial replicas down"
          icon={AlertTriangle}
          colorClass="text-amber-600"
          bgClass="bg-amber-50/40"
          borderClass="border-amber-200"
        />
        <KpiCard
          title="Failed / Offline"
          value={loading ? '…' : data?.summary.failed ?? 0}
          subtitle="Action required"
          icon={XCircle}
          colorClass="text-red-600"
          bgClass="bg-red-50/40"
          borderClass="border-red-200"
        />
        <KpiCard
          title="Pod Replicas"
          value={loading ? '…' : `${data?.summary.availableReplicas ?? 0} / ${data?.summary.targetReplicas ?? 0}`}
          subtitle="Available / Target"
          icon={Box}
          colorClass="text-violet-600"
          bgClass="bg-violet-50/40"
          borderClass="border-violet-200"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white border border-slate-200">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by deployment name, ID, or namespace..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <select
          value={namespaceFilter}
          onChange={(e) => setNamespaceFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Namespaces</option>
          {(data?.namespaces ?? []).map(ns => (
            <option key={ns} value={ns}>{ns}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="running">Running</option>
          <option value="degraded">Degraded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="space-y-2 border border-slate-200 p-4 bg-white">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={refresh} />
      ) : filteredDeployments.length === 0 ? (
        <EmptyState
          title="No Deployments Found"
          description="No deployment objects matched your current search query or namespace filter."
        />
      ) : (
        <div className="border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-xs min-w-[840px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Deployment Name</th>
                <th className="px-4 py-3 text-left">Namespace</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Replicas</th>
                <th className="px-4 py-3 text-left">CPU Usage</th>
                <th className="px-4 py-3 text-left">Memory Usage</th>
                <th className="px-4 py-3 text-left">Restarts</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeployments.map((dep) => {
                const cpu = formatCpuString(dep.cpuUsage)
                const mem = formatMemoryString(dep.memoryUsage)

                return (
                  <tr
                    key={dep.id}
                    onClick={() => setSelectedDeployment(dep)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                        {dep.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{dep.id}</div>
                    </td>

                    {/* Namespace */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 font-mono text-[11px] bg-slate-50 border border-slate-200 text-slate-600">
                        {dep.namespace}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={dep.status}
                        variant={deploymentStatusVariant(dep.status)}
                        dot
                      />
                    </td>

                    {/* Replicas */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {dep.availableReplicas} / {dep.replicas}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className={cn(
                              'h-full',
                              dep.availableReplicas === dep.replicas
                                ? 'bg-emerald-500'
                                : dep.availableReplicas > 0
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            )}
                            style={{
                              width: `${(dep.replicas > 0 ? dep.availableReplicas / dep.replicas : 0) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* CPU */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {cpu.formatted}
                    </td>

                    {/* Memory */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {mem.formatted}
                    </td>

                    {/* Restarts */}
                    <td className="px-4 py-3 font-mono">
                      <span className={cn(
                        'px-1.5 py-0.5 text-[11px] font-semibold border',
                        (dep.restartCount || 0) > 3
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}>
                        {dep.restartCount || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDeployment(dep)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                      >
                        Details <ArrowUpRight size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Deployment Detail Drawer */}
      {selectedDeployment && (
        <DeploymentDetailDrawer
          deployment={selectedDeployment}
          onClose={() => setSelectedDeployment(null)}
        />
      )}

    </div>
  )
}
