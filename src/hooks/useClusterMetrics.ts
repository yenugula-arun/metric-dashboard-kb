import { useState, useEffect, useCallback } from 'react'
import { metricsService }                    from '@/api/cluster/metricsService'
import type {
  MetricsOverview,
  PodCpuEntry,
  PodMemoryEntry,
  NodeCpuEntry,
  NodeMemoryEntry,
} from '@/types'

interface ClusterMetricsResult {
  overview:     MetricsOverview | null
  podsCpu:      PodCpuEntry[]
  podsMemory:   PodMemoryEntry[]
  nodesCpu:     NodeCpuEntry[]
  nodesMemory:  NodeMemoryEntry[]
  loading:      boolean
  error:        string | null
  cpuError:     string | null
  memoryError:  string | null
  refresh:      () => void
}

/**
 * useClusterMetrics — fetches all metrics from /metrics/* endpoints in parallel.
 *
 * Fetches:
 *   • GET /metrics/overview
 *   • GET /metrics/pods/cpu
 *   • GET /metrics/pods/memory
 *   • GET /metrics/nodes/cpu
 *   • GET /metrics/nodes/memory
 */
export function useClusterMetrics(): ClusterMetricsResult {
  const [overview,    setOverview]    = useState<MetricsOverview | null>(null)
  const [podsCpu,     setPodsCpu]     = useState<PodCpuEntry[]>([])
  const [podsMemory,  setPodsMemory]  = useState<PodMemoryEntry[]>([])
  const [nodesCpu,    setNodesCpu]    = useState<NodeCpuEntry[]>([])
  const [nodesMemory, setNodesMemory] = useState<NodeMemoryEntry[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [cpuError,    setCpuError]    = useState<string | null>(null)
  const [memoryError, setMemoryError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setCpuError(null)
    setMemoryError(null)

    const [overviewRes, podsCpuRes, podsMemoryRes, nodesCpuRes, nodesMemoryRes] = await Promise.all([
      metricsService.getOverview(),
      metricsService.getPodsCpu(),
      metricsService.getPodsMemory(),
      metricsService.getNodesCpu(),
      metricsService.getNodesMemory(),
    ])

    if (overviewRes.success && overviewRes.data) {
      setOverview(overviewRes.data)
    }

    if (podsCpuRes.success && podsCpuRes.data) {
      setPodsCpu(podsCpuRes.data)
    } else if (!podsCpuRes.success) {
      setCpuError('CPU metrics are initializing in Prometheus...')
    }

    if (podsMemoryRes.success && podsMemoryRes.data) {
      setPodsMemory(podsMemoryRes.data)
    } else if (!podsMemoryRes.success) {
      setMemoryError('Memory metrics are initializing in Prometheus...')
    }

    if (nodesCpuRes.success && nodesCpuRes.data) {
      setNodesCpu(nodesCpuRes.data)
    }

    if (nodesMemoryRes.success && nodesMemoryRes.data) {
      setNodesMemory(nodesMemoryRes.data)
    }

    // General error only if ALL endpoints fail
    if (
      !overviewRes.success &&
      !podsCpuRes.success &&
      !podsMemoryRes.success &&
      !nodesCpuRes.success &&
      !nodesMemoryRes.success
    ) {
      setError('Prometheus metrics server is starting up or unavailable.')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    overview,
    podsCpu,
    podsMemory,
    nodesCpu,
    nodesMemory,
    loading,
    error,
    cpuError,
    memoryError,
    refresh: fetchData,
  }
}
