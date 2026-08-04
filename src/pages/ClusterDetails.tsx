import { useState, useMemo } from 'react'
import { useParams }       from 'react-router-dom'
import {
  Server,
  MapPin,
  Cpu,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  MemoryStick,
  Globe,
  Wifi,
  WifiOff,
  Package,
  TrendingUp,
  ShieldCheck,
  DownloadCloud,
  Loader2,
  Sparkles,
  Info,
  Box,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { useAWSContext }         from '@/context/AWSContext'
import { useClusterDetails }     from '@/hooks/useClusterDetails'
import { useClusterConnect }     from '@/hooks/useClusterConnect'
import { usePrometheusStatus }   from '@/hooks/usePrometheusStatus'
import { useClusterMetrics }     from '@/hooks/useClusterMetrics'
import { prometheusService }     from '@/api/prometheus/prometheusService'
import { Breadcrumb }            from '@/components/Breadcrumb'
import { StatusBadge }           from '@/components/StatusBadge'
import { ErrorState }            from '@/components/ErrorState'
import { Skeleton }              from '@/components/LoadingSkeleton'
import { EmptyState }            from '@/components/EmptyState'
import { ROUTES }                from '@/constants/routes'
import { cn }                    from '@/utils/cn'
import type { EKSClusterStatus, K8sPodItem, NodeDetailInfo } from '@/types'

// ─── Formatting Helpers ───────────────────────────────────────────────────────

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

/** Formats millicores (m) into vCPUs */
function formatCpu(millicores: number): { formatted: string; vCpu: string } {
  const m = typeof millicores === 'number' && !isNaN(millicores) ? millicores : 0
  const vCpuVal = m / 1000
  return {
    formatted: `${m.toFixed(0)}m`,
    vCpu: `${vCpuVal.toFixed(2)} vCPU`,
  }
}

/** Formats memory in MiB to human-readable MiB / GiB strings */
function formatMemory(mib: number): { formatted: string; converted: string } {
  const val = typeof mib === 'number' && !isNaN(mib) ? mib : 0
  if (val >= 1024) {
    return {
      formatted: `${val.toFixed(0)} MiB`,
      converted: `${(val / 1024).toFixed(2)} GiB`,
    }
  }
  return {
    formatted: `${val.toFixed(1)} MiB`,
    converted: `${val.toFixed(0)} MiB`,
  }
}

function getUsageColor(pct: number): string {
  if (pct >= 85) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  if (pct >= 35) return 'bg-blue-500'
  return 'bg-emerald-500'
}

/** Plain English descriptions of what each namespace is for */
const NAMESPACE_PURPOSES: Record<string, { category: string; description: string; variant: 'system' | 'app' | 'monitoring' }> = {
  'kube-system': {
    category: 'Core Kubernetes Control Plane',
    description: 'Hosts core cluster management addons like AWS Load Balancer Controller, CoreDNS, aws-node CNI networking, and kube-proxy.',
    variant: 'system',
  },
  'default': {
    category: 'Application Workloads',
    description: 'Primary default namespace for user application deployments, APIs, microservices, and databases unless assigned elsewhere.',
    variant: 'app',
  },
  'prometheus': {
    category: 'Monitoring & Telemetry',
    description: 'Hosts Prometheus server, Alertmanager, and metrics scraper agents powering real-time CPU/Memory charts and AI cost optimizations.',
    variant: 'monitoring',
  },
  'kube-public': {
    category: 'Public Metadata',
    description: 'Contains cluster info ConfigMaps accessible by all users and unauthenticated service accounts.',
    variant: 'system',
  },
  'kube-node-lease': {
    category: 'Node Heartbeats',
    description: 'Holds Lease objects for each node in the cluster, used by the kubelet to send periodic node heartbeats to the API server.',
    variant: 'system',
  },
}

function getNamespaceInfo(name: string) {
  if (NAMESPACE_PURPOSES[name]) {
    return NAMESPACE_PURPOSES[name]
  }
  if (name.startsWith('kube-')) {
    return {
      category: 'System Component',
      description: 'System namespace dedicated to specialized cluster infrastructure and runtime plugins.',
      variant: 'system' as const,
    }
  }
  return {
    category: 'User Domain Workloads',
    description: 'Custom namespace for isolated application services, environments, or microservice stacks.',
    variant: 'app' as const,
  }
}

function InfoField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={cn('text-sm text-slate-800 break-all leading-snug', mono && 'font-mono text-xs text-slate-700')}>
        {value}
      </span>
    </div>
  )
}

function PromCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 border text-xs font-medium',
      ok
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50     border-red-200     text-red-600'
    )}>
      {ok
        ? <CheckCircle2 size={13} className="shrink-0" />
        : <XCircle      size={13} className="shrink-0" />
      }
      {label}
    </div>
  )
}

function MetricRow({
  rank, name, value, metricType, max,
}: {
  rank: number
  name: string
  value: number
  metricType: 'cpu' | 'memory'
  max: number
}) {
  const displayVal = typeof value === 'number' && !isNaN(value) ? value : 0
  const pct = max > 0 ? Math.min(Math.max((displayVal / max) * 100, 0), 100) : 0

  const cpuFormat = metricType === 'cpu' ? formatCpu(displayVal) : null
  const memFormat = metricType === 'memory' ? formatMemory(displayVal) : null

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 overflow-hidden">
      <span className="text-[11px] font-mono text-slate-400 w-4 shrink-0 text-right">{rank}</span>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-baseline justify-between mb-1.5 gap-2 overflow-hidden">
          <span
            className="text-xs font-mono text-slate-800 truncate font-medium"
            title={name}
          >
            {name}
          </span>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-slate-900">
              {metricType === 'cpu' ? cpuFormat?.formatted : memFormat?.formatted}
            </span>
            <span className="text-[10px] text-slate-500 font-mono ml-1.5 bg-slate-100 px-1 py-0.5 border border-slate-200">
              {metricType === 'cpu' ? cpuFormat?.vCpu : memFormat?.converted}
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 overflow-hidden w-full">
          <div
            className={cn('h-full transition-all duration-500 max-w-full', getUsageColor(pct))}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function Tab({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap',
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}

function StatChip({
  icon: Icon, label, value, color = 'text-slate-700'
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string; value: string; color?: string
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200">
      <Icon size={14} className="text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className={cn('text-sm font-bold leading-none', color)}>{value}</p>
      </div>
    </div>
  )
}

interface InstallerProps {
  clusterName: string
  roleArn: string
  onComplete: () => void
}

const INSTALL_STEPS = [
  { id: 1, title: 'Provisioning dedicated "prometheus" namespace' },
  { id: 2, title: 'Deploying Prometheus Server & ConfigMaps' },
  { id: 3, title: 'Configuring Kubernetes Service endpoints' },
  { id: 4, title: 'Verifying pod readiness & metrics scraper' },
]

function PrometheusInstaller({ clusterName, roleArn, onComplete }: InstallerProps) {
  const [status, setStatus]     = useState<'idle' | 'installing' | 'success' | 'error'>('idle')
  const [currentStep, setStep] = useState<number>(0)
  const [errorMessage, setErrMsg] = useState<string | null>(null)

  const startInstallation = async () => {
    setStatus('installing')
    setStep(1)
    setErrMsg(null)

    const stepTimer1 = setTimeout(() => setStep(2), 1200)
    const stepTimer2 = setTimeout(() => setStep(3), 2600)
    const stepTimer3 = setTimeout(() => setStep(4), 4000)

    try {
      const res = await prometheusService.install(clusterName, roleArn)

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)

      if (res.success && res.data) {
        setStep(5)
        setStatus('success')
        setTimeout(() => {
          onComplete()
        }, 1500)
      } else {
        setStatus('error')
        setErrMsg(res.error ?? 'Installation failed')
      }
    } catch (err) {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Unknown installation error')
    }
  }

  const progressPct = status === 'success' ? 100 : Math.min((currentStep / 4) * 100, 90)

  return (
    <div className="bg-white border border-slate-200 p-6 max-w-2xl mx-auto my-4 space-y-6">

      {status === 'idle' && (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <DownloadCloud size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prometheus Stack Not Installed</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Prometheus is required to collect real-time CPU & memory metrics for <strong>{clusterName}</strong>.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={startInstallation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles size={14} />
              Install Prometheus Stack
            </button>
          </div>
        </div>
      )}

      {status === 'installing' && (
        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Installing Prometheus Stack...</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600">{Math.round(progressPct)}%</span>
          </div>

          <div className="h-2 bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-2.5 pt-2">
            {INSTALL_STEPS.map((step) => {
              const isDone    = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-xs border transition-colors',
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 size={14} className="animate-spin text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 border border-slate-300 shrink-0" />
                  )}
                  <span>{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center space-y-3 py-4 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Prometheus Installed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Loading metrics and updating health status...
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-800 text-xs">
            <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Installation Failed</p>
              <p className="mt-0.5 text-red-600 opacity-90">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={startInstallation}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Retry Installation
          </button>
        </div>
      )}

    </div>
  )
}

type TabId = 'overview' | 'nodes' | 'pods' | 'namespaces' | 'prometheus' | 'metrics'

export default function ClusterDetailsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { roleArn } = useAWSContext()
  const { clusterName = '' } = useParams<{ clusterName: string }>()
  const { cluster, accountId, loading, error, refresh } = useClusterDetails(clusterName)

  // Local state for Pods tab filtering
  const [podSearch, setPodSearch] = useState('')
  const [podNsFilter, setPodNsFilter] = useState<string>('ALL')
  const [podStatusFilter, setPodStatusFilter] = useState<string>('ALL')

  // Expanded node tracking for Nodes tab
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

  const toggleNodeExpand = (nodeName: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeName]: !prev[nodeName] }))
  }

  const {
    data: connectionData,
    loading: connectLoading,
    error: connectError,
    refresh: refreshConnect,
  } = useClusterConnect(clusterName, roleArn)

  const {
    data: prometheusData,
    loading: promLoading,
    error: promError,
    refresh: refreshProm,
  } = usePrometheusStatus(clusterName, roleArn)

  const {
    overview,
    podsCpu,
    podsMemory,
    nodesCpu,
    nodesMemory,
    loading: metricsLoading,
    error: metricsError,
    cpuError,
    memoryError,
    refresh: refreshMetrics,
  } = useClusterMetrics()

  const breadcrumbs = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'Clusters',  href: ROUTES.CLUSTERS  },
    { label: clusterName },
  ]

  const refreshAll = () => { refresh(); refreshConnect(); refreshProm(); refreshMetrics() }

  // Filtered Pods list
  const filteredPods = useMemo(() => {
    const allPods = connectionData?.pods ?? []
    const q = podSearch.trim().toLowerCase()

    return allPods.filter((p: K8sPodItem) => {
      const name = p.metadata?.name ?? ''
      const ns   = p.metadata?.namespace ?? 'default'
      const node = p.spec?.nodeName ?? p.status?.hostIP ?? ''
      const img  = p.spec?.containers?.[0]?.image ?? ''
      const status = p.status?.phase ?? 'Unknown'

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        node.toLowerCase().includes(q) ||
        img.toLowerCase().includes(q)

      const matchesNs = podNsFilter === 'ALL' || ns === podNsFilter
      const matchesStatus = podStatusFilter === 'ALL' || status.toUpperCase() === podStatusFilter.toUpperCase()

      return matchesSearch && matchesNs && matchesStatus
    })
  }, [connectionData, podSearch, podNsFilter, podStatusFilter])

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={refresh} />

  if (!cluster) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Breadcrumb items={breadcrumbs} />
        <ErrorState
          description={`Cluster "${clusterName}" was not found.`}
          onRetry={refresh}
        />
      </div>
    )
  }

  const prom             = prometheusData?.prometheus
  const isConnected      = connectionData?.connected ?? false
  const maxCpuVal        = podsCpu.length     > 0 ? Math.max(...podsCpu.map(p => p.cpu_millicores), 1) : 1
  const maxMemoryVal     = podsMemory.length  > 0 ? Math.max(...podsMemory.map(p => p.memory_mib), 1)  : 1
  const maxNodeCpuVal    = nodesCpu.length    > 0 ? Math.max(...nodesCpu.map(n => n.cpu_millicores || 0), 1) : 1
  const maxNodeMemoryVal = nodesMemory.length > 0 ? Math.max(...nodesMemory.map(n => n.memory_mib || 0), 1) : 1
  const promHealthyAll   = prom ? Object.values(prom).every(Boolean) : false

  return (
    <div className="space-y-0 animate-fade-in">

      <Breadcrumb items={breadcrumbs} />

      {/* Hero Header */}
      <div className="mt-4 bg-white border border-slate-200">
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-600 flex items-center justify-center shrink-0">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{cluster.name}</h1>
                <StatusBadge
                  label={cluster.status}
                  variant={clusterStatusVariant(cluster.status)}
                  dot
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{cluster.arn}</p>
            </div>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Stat chips row */}
        <div className="flex flex-wrap gap-3 px-6 py-4">
          <StatChip icon={MapPin} label="Region" value={cluster.region} />
          {accountId && <StatChip icon={Globe} label="AWS Account" value={accountId} />}
          <StatChip
            icon={Server}
            label="Compute Nodes"
            value={connectLoading ? 'Checking…' : `${connectionData?.totalNodes ?? 0} Nodes`}
            color="text-slate-900"
          />
          <StatChip
            icon={Box}
            label="Total Pods"
            value={connectLoading ? 'Checking…' : `${connectionData?.totalPods ?? 0} Pods`}
            color="text-blue-700"
          />
          <StatChip
            icon={isConnected ? Wifi : WifiOff}
            label="Connection"
            value={connectLoading ? 'Checking…' : isConnected ? 'Connected' : 'Not connected'}
            color={connectLoading ? 'text-slate-500' : isConnected ? 'text-emerald-600' : 'text-amber-600'}
          />
          <StatChip
            icon={ShieldCheck}
            label="Prometheus Stack"
            value={promLoading ? 'Checking…' : promHealthyAll ? 'Healthy' : prom?.installed ? 'Degraded' : 'Not installed'}
            color={promLoading ? 'text-slate-500' : promHealthyAll ? 'text-emerald-600' : prom?.installed ? 'text-amber-600' : 'text-red-600'}
          />
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-slate-100 overflow-x-auto">
          <Tab active={activeTab === 'overview'}    onClick={() => setActiveTab('overview')}    icon={Activity}    label="Overview" />
          <Tab active={activeTab === 'nodes'}       onClick={() => setActiveTab('nodes')}       icon={Server}      label={`Nodes (${connectionData?.totalNodes ?? 0})`} />
          <Tab active={activeTab === 'pods'}        onClick={() => setActiveTab('pods')}        icon={Box}         label={`Pods & Workloads (${connectionData?.totalPods ?? 0})`} />
          <Tab active={activeTab === 'namespaces'}  onClick={() => setActiveTab('namespaces')}  icon={Package}     label={`Namespaces (${connectionData?.namespaces.length ?? 0})`} />
          <Tab active={activeTab === 'prometheus'}  onClick={() => setActiveTab('prometheus')}  icon={ShieldCheck} label="Prometheus" />
          <Tab active={activeTab === 'metrics'}     onClick={() => setActiveTab('metrics')}     icon={TrendingUp}  label="Resource Metrics" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-t-0 border-slate-200">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cluster Overview &amp; Inventory</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5">
                <InfoField label="Cluster Name" value={cluster.name} />
                <InfoField label="Status"       value={cluster.status} />
                <InfoField label="Region"       value={cluster.region} mono />
                {accountId && <InfoField label="AWS Account ID" value={accountId} mono />}
                <InfoField label="Total Nodes" value={`${connectionData?.totalNodes ?? 0} EC2 compute nodes`} mono />
                <InfoField label="Total Pods" value={`${connectionData?.totalPods ?? 0} workload pods`} mono />
                <InfoField label="ARN" value={cluster.arn} mono />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Connection Status</p>
              {connectLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : connectError ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-xs text-red-600">
                  <AlertTriangle size={14} className="shrink-0" /> {connectError}
                </div>
              ) : (
                <div className={cn(
                  'flex items-start gap-3 p-4 border text-sm',
                  isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50   border-amber-200   text-amber-800'
                )}>
                  {isConnected
                    ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    : <WifiOff      size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  }
                  <div>
                    <p className="font-semibold">{isConnected ? 'Cluster connected successfully' : 'Cluster not connected'}</p>
                    <p className="text-xs mt-0.5 opacity-75">
                      {isConnected
                        ? 'The backend is actively querying K8s compute nodes, pods, and namespaces for this cluster.'
                        : 'Could not reach this cluster. Verify IAM role permissions.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NODES TAB (NEW) */}
        {activeTab === 'nodes' && (
          <div className="p-6 space-y-6">
            {connectLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : connectError ? (
              <ErrorState description={connectError} onRetry={refreshConnect} />
            ) : (
              <>
                {/* Node Summary Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Compute Nodes</p>
                    <p className="text-xl font-semibold text-slate-800">{connectionData?.totalNodes ?? 0}</p>
                    <p className="text-[11px] text-slate-500">EC2 Worker Instances</p>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Node Status</p>
                    <p className="text-xl font-semibold text-emerald-900">
                      {(connectionData?.nodeDetails ?? []).filter(n => n.status === 'Ready').length} / {connectionData?.totalNodes ?? 0} Ready
                    </p>
                    <p className="text-[11px] text-emerald-700">Healthy Kubelets</p>
                  </div>

                  <div className="p-4 bg-blue-50/60 border border-blue-200/80 space-y-1">
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Total Pod Workloads</p>
                    <p className="text-xl font-semibold text-blue-900">{connectionData?.totalPods ?? 0}</p>
                    <p className="text-[11px] text-blue-700">Pods scheduled across nodes</p>
                  </div>
                </div>

                {/* Nodes List Cards */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Node Host Inventory</p>

                  {(connectionData?.nodeDetails ?? []).length === 0 ? (
                    <EmptyState title="No Nodes Found" description="Could not discover host compute nodes." />
                  ) : (
                    (connectionData?.nodeDetails ?? []).map((node: NodeDetailInfo) => {
                      const isExpanded = expandedNodes[node.name] ?? false

                      // Find matching node CPU & Memory metrics if available
                      const cpuMetric = nodesCpu.find(n => n.instance === node.name || n.instance.includes(node.hostIP))
                      const memMetric = nodesMemory.find(n => n.instance === node.name || n.instance.includes(node.hostIP))

                      const cpuVal = cpuMetric?.cpu_millicores ?? 0
                      const memVal = memMetric?.memory_mib ?? 0

                      const formattedCpu = formatCpu(cpuVal)
                      const formattedMem = formatMemory(memVal)

                      return (
                        <div key={node.name} className="border border-slate-200 bg-white shadow-xs">
                          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <Server size={16} className="text-blue-600 shrink-0" />
                                <h3 className="text-xs sm:text-sm font-medium font-mono text-slate-700">{node.name}</h3>
                                <span className="px-2 py-0.5 font-medium text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700">
                                  {node.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono pl-7">
                                <span>Host IP: <span className="text-slate-700 font-medium">{node.hostIP}</span></span>
                                {node.architecture && <span>Arch: <span className="text-slate-700 font-medium">{node.architecture}</span></span>}
                                {node.kubeletVersion && <span>Kubelet: <span className="text-slate-700 font-medium">{node.kubeletVersion}</span></span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              {/* CPU metric pill */}
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">CPU Load</p>
                                <p className="text-xs font-semibold text-slate-800">{formattedCpu.formatted}</p>
                                <p className="text-[10px] font-mono text-blue-600">{formattedCpu.vCpu}</p>
                              </div>

                              {/* Memory metric pill */}
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Memory Load</p>
                                <p className="text-xs font-semibold text-slate-800">{formattedMem.formatted}</p>
                                <p className="text-[10px] font-mono text-violet-600">{formattedMem.converted}</p>
                              </div>

                              {/* Pod count badge */}
                              <div className="text-right border-l border-slate-200 pl-4">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Assigned Pods</p>
                                <p className="text-xs font-semibold text-slate-800">{node.podCount} Pods</p>
                              </div>

                              <button
                                onClick={() => toggleNodeExpand(node.name)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Pods' : 'View Pods'}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Pods list on this Node */}
                          {isExpanded && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <Box size={14} className="text-blue-600" />
                                {node.pods.length} Pods Running on {node.name}:
                              </p>

                              {node.pods.length === 0 ? (
                                <p className="text-xs text-slate-400 font-italic">No pods currently scheduled on this node host.</p>
                              ) : (
                                <div className="overflow-x-auto border border-slate-200 bg-white">
                                  <table className="w-full text-xs">
                                    <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Pod Name</th>
                                        <th className="px-3 py-2 text-left">Namespace</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Pod IP</th>
                                        <th className="px-3 py-2 text-left">Container Image</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {node.pods.map((p: K8sPodItem) => (
                                        <tr key={p.metadata?.name} className="hover:bg-slate-50">
                                          <td className="px-3 py-2 font-mono font-medium text-slate-700">{p.metadata?.name}</td>
                                          <td className="px-3 py-2 font-mono text-slate-600">{p.metadata?.namespace ?? 'default'}</td>
                                          <td className="px-3 py-2 font-semibold text-emerald-700">{p.status?.phase ?? 'Running'}</td>
                                          <td className="px-3 py-2 font-mono text-slate-500">{p.status?.podIP ?? '—'}</td>
                                          <td className="px-3 py-2 font-mono text-slate-500 truncate max-w-[200px]">{p.spec?.containers?.[0]?.image ?? '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* PODS TAB */}
        {activeTab === 'pods' && (
          <div className="p-6 space-y-4">
            {connectLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : connectError ? (
              <ErrorState description={connectError} onRetry={refreshConnect} />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-200">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Total Pods</p>
                    <p className="text-xl font-extrabold text-blue-950 mt-0.5">{connectionData?.totalPods ?? 0}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Running</p>
                    <p className="text-xl font-extrabold text-emerald-950 mt-0.5">
                      {(connectionData?.pods ?? []).filter(p => p.status?.phase === 'Running').length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pending / Issues</p>
                    <p className="text-xl font-extrabold text-amber-950 mt-0.5">
                      {(connectionData?.pods ?? []).filter(p => p.status?.phase !== 'Running').length}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Unique Nodes</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{connectionData?.totalNodes ?? 0}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-2">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={podSearch}
                      onChange={(e) => setPodSearch(e.target.value)}
                      placeholder="Search pod name, node, container image..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <select
                    value={podNsFilter}
                    onChange={(e) => setPodNsFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Namespaces</option>
                    {(connectionData?.namespaces ?? []).map(ns => (
                      <option key={ns} value={ns}>{ns} ({connectionData?.namespacePodCounts[ns] ?? 0})</option>
                    ))}
                  </select>

                  <select
                    value={podStatusFilter}
                    onChange={(e) => setPodStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Running">Running</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {filteredPods.length === 0 ? (
                  <EmptyState title="No Pods Found" description="No pods match your current search or namespace filter." />
                ) : (
                  <div className="overflow-x-auto border border-slate-200">
                    <table className="w-full min-w-[720px] text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Pod Name</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Namespace</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Node Host</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Pod IP</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide">Container Image</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPods.map((pod) => {
                          const name = pod.metadata?.name ?? 'unknown'
                          const ns = pod.metadata?.namespace ?? 'default'
                          const phase = pod.status?.phase ?? 'Unknown'
                          const node = pod.spec?.nodeName ?? pod.status?.hostIP ?? '—'
                          const podIp = pod.status?.podIP ?? '—'
                          const image = pod.spec?.containers?.[0]?.image ?? '—'
                          const isRunning = phase === 'Running'

                          return (
                            <tr key={name} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-mono font-medium text-slate-700 break-all max-w-[240px]">
                                {name}
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  'px-2 py-0.5 font-mono text-[11px] border',
                                  ns.startsWith('kube-') ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-200 text-blue-700'
                                )}>
                                  {ns}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn(
                                  'inline-flex items-center gap-1.5 px-2 py-0.5 font-semibold text-[11px] border',
                                  isRunning
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                )}>
                                  <span className={cn('w-1.5 h-1.5 rounded-full', isRunning ? 'bg-emerald-500' : 'bg-amber-500')} />
                                  {phase}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600 max-w-[180px] truncate" title={node}>
                                {node}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-500">{podIp}</td>
                              <td className="px-4 py-3 font-mono text-slate-500 max-w-[220px] truncate" title={image}>
                                {image}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* NAMESPACES TAB */}
        {activeTab === 'namespaces' && (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">What are Kubernetes Namespaces?</p>
                <p className="mt-0.5">
                  Namespaces partition cluster resources between system infrastructure (like CNI networking &amp; load balancing) and application workloads.
                </p>
              </div>
            </div>

            {connectLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : connectError ? (
              <ErrorState description={connectError} onRetry={refreshConnect} />
            ) : !isConnected ? (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <AlertTriangle size={16} className="shrink-0" />
                Cluster is not connected — namespace list is unavailable.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectionData!.namespaces.map((ns) => {
                  const info = getNamespaceInfo(ns)
                  const podCount = connectionData?.namespacePodCounts[ns] ?? 0

                  return (
                    <div key={ns} className="bg-white border border-slate-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={16} className={info.variant === 'system' ? 'text-slate-500' : info.variant === 'monitoring' ? 'text-violet-600' : 'text-blue-600'} />
                          <h3 className="text-sm font-bold font-mono text-slate-900">{ns}</h3>
                        </div>
                        <span className={cn(
                          'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border',
                          info.variant === 'system' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          info.variant === 'monitoring' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        )}>
                          {info.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {info.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                        <span>Pods in namespace:</span>
                        <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5">
                          {podCount} pod{podCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PROMETHEUS TAB */}
        {activeTab === 'prometheus' && (
          <div className="p-6">
            {promLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : promError ? (
              <ErrorState description={promError} onRetry={refreshProm} />
            ) : prom && prom.installed ? (
              <div className="space-y-6">
                <div className={cn(
                  'flex items-start gap-3 p-4 border',
                  promHealthyAll
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50   border-amber-200   text-amber-800'
                )}>
                  {promHealthyAll
                    ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  }
                  <div>
                    <p className="font-semibold text-sm">
                      {promHealthyAll
                        ? 'Prometheus is fully healthy'
                        : 'Prometheus is installed but degraded'}
                    </p>
                    <p className="text-xs mt-0.5 opacity-75">
                      {promHealthyAll
                        ? 'All components are running. Resource metrics are actively collected.'
                        : 'Some components are failing. Metrics may be incomplete.'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Component Status</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <PromCheck label="Installed"  ok={prom.installed}  />
                    <PromCheck label="Healthy"    ok={prom.healthy}    />
                    <PromCheck label="Namespace"  ok={prom.namespace}  />
                    <PromCheck label="Service"    ok={prom.service}    />
                    <PromCheck label="Deployment" ok={prom.deployment} />
                  </div>
                </div>
              </div>
            ) : (
              <PrometheusInstaller clusterName={clusterName} roleArn={roleArn} onComplete={refreshAll} />
            )}
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900">Understanding Resource Metrics Units</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
                  <span><strong>CPU millicores (m):</strong> 1,000m = 1 vCPU / Core (e.g. 250m = 0.25 vCPU)</span>
                  <span><strong>Memory (MiB):</strong> 1,024 MiB = 1.0 GiB (e.g. 2,048 MiB = 2.0 GiB)</span>
                </div>
              </div>
            </div>

            {metricsLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-72" />
                  <Skeleton className="h-72" />
                </div>
              </div>
            ) : metricsError ? (
              <ErrorState description={metricsError} onRetry={refreshMetrics} />
            ) : (
              <div className="space-y-6">

                {/* CPU & Memory Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CPU Card */}
                  <div className="border border-slate-200 p-5 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cluster-wide CPU Usage</span>
                      <span className="ml-auto text-xs text-slate-400 font-mono">1,000m = 1 vCPU</span>
                    </div>
                    {overview?.cpu.cpu_usage != null ? (
                      <>
                        <div className="flex items-baseline justify-between mb-2">
                          <p className="text-3xl font-bold text-slate-900">
                            {overview.cpu.cpu_usage.toFixed(1)}<span className="text-base font-normal text-slate-500 ml-1">{overview.cpu.unit}</span>
                          </p>
                          <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                            {(overview.cpu.cpu_usage / 100).toFixed(2)} vCPU cores
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-700', getUsageColor(overview.cpu.cpu_usage))}
                            style={{ width: `${Math.min(overview.cpu.cpu_usage, 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-slate-300 mb-2">N/A</p>
                        <p className="text-[11px] text-amber-600">Prometheus metrics collecting...</p>
                      </div>
                    )}
                  </div>

                  {/* Memory Card */}
                  <div className="border border-slate-200 p-5 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <MemoryStick size={16} className="text-violet-600" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cluster-wide Memory Usage</span>
                      <span className="ml-auto text-xs text-slate-400 font-mono">1,024 MiB = 1 GiB</span>
                    </div>
                    {overview?.memory.memory_usage != null ? (
                      <>
                        <div className="flex items-baseline justify-between mb-2">
                          <p className="text-3xl font-bold text-slate-900">
                            {overview.memory.memory_usage.toFixed(1)}<span className="text-base font-normal text-slate-500 ml-1">{overview.memory.unit}</span>
                          </p>
                          <span className="text-xs font-mono font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 border border-violet-200">
                            {(overview.memory.memory_usage / 1024).toFixed(2)} GiB RAM
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-700', getUsageColor(overview.memory.memory_usage))}
                            style={{ width: `${Math.min(overview.memory.memory_usage, 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-slate-300 mb-2">N/A</p>
                        <p className="text-[11px] text-amber-600">Prometheus metrics collecting...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pod Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CPU Pods */}
                  <div className="border border-slate-200">
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100">
                      <Cpu size={14} className="text-blue-600 shrink-0" />
                      <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Top Pods by CPU</h3>
                      <span className="ml-auto text-[10px] text-blue-600 font-mono bg-blue-100/70 px-1.5 py-0.5">
                        millicores &amp; vCPU
                      </span>
                    </div>
                    <div className="px-4 py-1">
                      {podsCpu.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          {cpuError ?? 'No CPU data available'}
                        </p>
                      ) : (
                        podsCpu.map((e, i) => (
                          <MetricRow
                            key={e.pod}
                            rank={i + 1}
                            name={e.pod}
                            value={e.cpu_millicores}
                            metricType="cpu"
                            max={maxCpuVal}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Memory Pods */}
                  <div className="border border-slate-200">
                    <div className="flex items-center gap-2 px-4 py-3 bg-violet-50 border-b border-violet-100">
                      <Database size={14} className="text-violet-600 shrink-0" />
                      <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wide">Top Pods by Memory</h3>
                      <span className="ml-auto text-[10px] text-violet-600 font-mono bg-violet-100/70 px-1.5 py-0.5">
                        MiB &amp; GiB
                      </span>
                    </div>
                    <div className="px-4 py-1">
                      {podsMemory.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          {memoryError ?? 'No memory data available'}
                        </p>
                      ) : (
                        podsMemory.map((e, i) => (
                          <MetricRow
                            key={e.pod}
                            rank={i + 1}
                            name={e.pod}
                            value={e.memory_mib}
                            metricType="memory"
                            max={maxMemoryVal}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Node Tables */}
                {(nodesCpu.length > 0 || nodesMemory.length > 0) && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Node Metrics Breakdown
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Node CPU */}
                      <div className="border border-slate-200">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <Cpu size={14} className="text-slate-600 shrink-0" />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Node CPU Usage</h3>
                          <span className="ml-auto text-[11px] text-slate-500 font-mono">millicores (m)</span>
                        </div>
                        <div className="px-4 py-1">
                          {nodesCpu.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No node CPU data available</p>
                          ) : (
                            nodesCpu.map((n, i) => {
                              const val = n.cpu_millicores || 0
                              return (
                                <MetricRow
                                  key={n.instance}
                                  rank={i + 1}
                                  name={n.instance}
                                  value={val}
                                  metricType="cpu"
                                  max={maxNodeCpuVal}
                                />
                              )
                            })
                          )}
                        </div>
                      </div>

                      {/* Node Memory */}
                      <div className="border border-slate-200">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <Database size={14} className="text-slate-600 shrink-0" />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Node Memory Usage</h3>
                          <span className="ml-auto text-[11px] text-slate-500 font-mono">MiB &amp; GiB</span>
                        </div>
                        <div className="px-4 py-1">
                          {nodesMemory.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No node memory data available</p>
                          ) : (
                            nodesMemory.map((n, i) => {
                              const val = n.memory_mib || 0
                              return (
                                <MetricRow
                                  key={n.instance}
                                  rank={i + 1}
                                  name={n.instance}
                                  value={val}
                                  metricType="memory"
                                  max={maxNodeMemoryVal}
                                />
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
