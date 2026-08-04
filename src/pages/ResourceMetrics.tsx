import { useState, useMemo } from 'react'
import {
  Cpu,
  Database,
  RefreshCw,
  Info,
  Search,
  AlertTriangle,
  TrendingUp,
  MemoryStick,
} from 'lucide-react'

import { useClusterMetrics } from '@/hooks/useClusterMetrics'
import { Skeleton }           from '@/components/LoadingSkeleton'
import { ErrorState }         from '@/components/ErrorState'
import { EmptyState }         from '@/components/EmptyState'
import { Section }            from '@/layouts/Section'
import { cn }                 from '@/utils/cn'

function formatCpu(millicores: number) {
  const m = typeof millicores === 'number' && !isNaN(millicores) ? millicores : 0
  return {
    mStr: `${m.toFixed(0)}m`,
    vCpuStr: `${(m / 1000).toFixed(2)} vCPU`,
  }
}

function formatMemory(mib: number) {
  const val = typeof mib === 'number' && !isNaN(mib) ? mib : 0
  if (val >= 1024) {
    return {
      mibStr: `${val.toFixed(0)} MiB`,
      convertedStr: `${(val / 1024).toFixed(2)} GiB`,
    }
  }
  return {
    mibStr: `${val.toFixed(1)} MiB`,
    convertedStr: `${val.toFixed(0)} MiB`,
  }
}

function getUsageBarColor(pct: number): string {
  if (pct >= 85) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  if (pct >= 35) return 'bg-blue-500'
  return 'bg-emerald-500'
}

export default function ResourceMetricsPage() {
  const {
    overview,
    podsCpu,
    podsMemory,
    nodesCpu,
    nodesMemory,
    loading,
    error,
    refresh,
  } = useClusterMetrics()

  const [search, setSearch] = useState('')

  const maxCpuVal     = useMemo(() => podsCpu.length > 0 ? Math.max(...podsCpu.map(p => p.cpu_millicores), 1) : 1, [podsCpu])
  const maxMemoryVal  = useMemo(() => podsMemory.length > 0 ? Math.max(...podsMemory.map(p => p.memory_mib), 1) : 1, [podsMemory])
  const maxNodeCpu    = useMemo(() => nodesCpu.length > 0 ? Math.max(...nodesCpu.map(n => n.cpu_millicores ?? (n as any).value ?? 0), 1) : 1, [nodesCpu])
  const maxNodeMem    = useMemo(() => nodesMemory.length > 0 ? Math.max(...nodesMemory.map(n => n.memory_mib ?? (n as any).value ?? 0), 1) : 1, [nodesMemory])

  const filteredPodsCpu = useMemo(() => {
    if (!search.trim()) return podsCpu
    return podsCpu.filter(p => p.pod.toLowerCase().includes(search.trim().toLowerCase()))
  }, [podsCpu, search])

  const filteredPodsMemory = useMemo(() => {
    if (!search.trim()) return podsMemory
    return podsMemory.filter(p => p.pod.toLowerCase().includes(search.trim().toLowerCase()))
  }, [podsMemory, search])

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Resource Metrics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time CPU and Memory utilization analytics formatted in human-readable vCPU and GiB units.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Refresh Metrics
        </button>
      </div>

      {/* Unit Reference Legend */}
      <div className="bg-white border border-slate-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-blue-600 shrink-0" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Kubernetes Resource Unit Guide
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <div className="bg-slate-50 p-3 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu size={13} className="text-blue-600" /> CPU Millicores (m)
            </span>
            <p className="text-[11px] text-slate-500">
              1,000 millicores (1000m) equals <strong>1 full vCPU / Core</strong>. 250m equals 0.25 vCPU (quarter core).
            </p>
          </div>
          <div className="bg-slate-50 p-3 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database size={13} className="text-violet-600" /> Memory Units (MiB & GiB)
            </span>
            <p className="text-[11px] text-slate-500">
              1,024 Mebibytes (1024 MiB) equals <strong>1.0 Gibibyte (GiB)</strong> of RAM allocation.
            </p>
          </div>
          <div className="bg-slate-50 p-3 border border-slate-200 space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-600" /> Utilization Levels
            </span>
            <div className="flex gap-2 text-[10px] pt-1">
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-semibold">Low &lt;35%</span>
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 font-semibold">Healthy &lt;70%</span>
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 font-semibold">High &lt;85%</span>
              <span className="bg-red-100 text-red-800 px-1.5 py-0.5 font-semibold">Critical &ge;85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Overview Gauges */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={refresh} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cluster CPU */}
          <div className="bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Cpu size={15} className="text-blue-600" /> Cluster CPU Utilization
              </span>
              <span className="text-xs font-mono text-slate-500">millicores</span>
            </div>
            {overview?.cpu.cpu_usage != null ? (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-4xl font-bold text-slate-900">
                    {overview.cpu.cpu_usage.toFixed(1)}<span className="text-lg font-normal text-slate-400 ml-1">{overview.cpu.unit}</span>
                  </p>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1">
                    {(overview.cpu.cpu_usage / 100).toFixed(2)} vCPU Cores
                  </span>
                </div>
                <div className="h-3 bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-700', getUsageBarColor(overview.cpu.cpu_usage))}
                    style={{ width: `${Math.min(overview.cpu.cpu_usage, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-4 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                No cluster-wide CPU metrics returned by Prometheus scraper.
              </div>
            )}
          </div>

          {/* Cluster Memory */}
          <div className="bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <MemoryStick size={15} className="text-violet-600" /> Cluster Memory Utilization
              </span>
              <span className="text-xs font-mono text-slate-500">MiB / GiB</span>
            </div>
            {overview?.memory.memory_usage != null ? (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-4xl font-bold text-slate-900">
                    {overview.memory.memory_usage.toFixed(1)}<span className="text-lg font-normal text-slate-400 ml-1">{overview.memory.unit}</span>
                  </p>
                  <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-1">
                    {(overview.memory.memory_usage / 1024).toFixed(2)} GiB
                  </span>
                </div>
                <div className="h-3 bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-700', getUsageBarColor(overview.memory.memory_usage))}
                    style={{ width: `${Math.min(overview.memory.memory_usage, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-4 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                No cluster-wide Memory metrics returned by Prometheus scraper.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pod Metrics Breakdown */}
      <Section title="Pod Resource Consumption" description="Ranked list of top pod consumers by CPU & Memory">
        <div className="bg-white border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter pods by name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* CPU Table */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu size={14} className="text-blue-600" /> Top Pods by CPU
                </span>
                <span className="text-[11px] font-mono text-slate-400">millicores &amp; vCPU</span>
              </div>
              {filteredPodsCpu.length === 0 ? (
                <EmptyState title="No CPU Pods" description="No pod CPU data matches your query." />
              ) : (
                <div className="space-y-3">
                  {filteredPodsCpu.map((p, idx) => {
                    const c = formatCpu(p.cpu_millicores)
                    const pct = maxCpuVal > 0 ? (p.cpu_millicores / maxCpuVal) * 100 : 0
                    return (
                      <div key={p.pod} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-800 truncate max-w-[220px]">
                            {idx + 1}. {p.pod}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{c.mStr}</span>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1">
                              {c.vCpuStr}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-500', getUsageBarColor(pct))}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Memory Table */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-violet-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Database size={14} className="text-violet-600" /> Top Pods by Memory
                </span>
                <span className="text-[11px] font-mono text-slate-400">MiB &amp; GiB</span>
              </div>
              {filteredPodsMemory.length === 0 ? (
                <EmptyState title="No Memory Pods" description="No pod memory data matches your query." />
              ) : (
                <div className="space-y-3">
                  {filteredPodsMemory.map((p, idx) => {
                    const m = formatMemory(p.memory_mib)
                    const pct = maxMemoryVal > 0 ? (p.memory_mib / maxMemoryVal) * 100 : 0
                    return (
                      <div key={p.pod} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-800 truncate max-w-[220px]">
                            {idx + 1}. {p.pod}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{m.mibStr}</span>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1">
                              {m.convertedStr}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-500', getUsageBarColor(pct))}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Node Metrics Section */}
      {(nodesCpu.length > 0 || nodesMemory.length > 0) && (
        <Section title="Kubernetes Node Breakdown" description="Compute node usage metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Cpu size={14} className="text-slate-600" /> Node CPU
              </h3>
              <div className="space-y-3">
                {nodesCpu.map((n, i) => {
                  const val = n.cpu_millicores ?? (n as any).value ?? 0
                  const c = formatCpu(val)
                  const pct = maxNodeCpu > 0 ? (val / maxNodeCpu) * 100 : 0
                  return (
                    <div key={n.instance} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-800">{i + 1}. {n.instance}</span>
                        <span className="font-bold text-slate-900">{c.mStr} ({c.vCpuStr})</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 overflow-hidden">
                        <div className="h-full bg-slate-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Database size={14} className="text-slate-600" /> Node Memory
              </h3>
              <div className="space-y-3">
                {nodesMemory.map((n, i) => {
                  const val = n.memory_mib ?? (n as any).value ?? 0
                  const m = formatMemory(val)
                  const pct = maxNodeMem > 0 ? (val / maxNodeMem) * 100 : 0
                  return (
                    <div key={n.instance} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-800">{i + 1}. {n.instance}</span>
                        <span className="font-bold text-slate-900">{m.mibStr} ({m.convertedStr})</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 overflow-hidden">
                        <div className="h-full bg-slate-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>
      )}

    </div>
  )
}
