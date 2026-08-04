import { useState, useEffect, useCallback } from 'react'
import { prometheusService }                 from '@/api/prometheus/prometheusService'
import type { PrometheusStatus, DataHookResult } from '@/types'

/**
 * usePrometheusStatus — POST /api/v1/prometheus/status
 *
 * Checks whether Prometheus is installed and healthy inside a specific cluster.
 *
 * The hook returns five granular boolean flags (via PrometheusStatus.prometheus):
 *   • installed   — Prometheus pods exist in the cluster
 *   • healthy     — all Prometheus pods are Ready
 *   • namespace   — a dedicated Prometheus namespace exists
 *   • service     — a Kubernetes Service for Prometheus exists
 *   • deployment  — a Kubernetes Deployment for Prometheus exists
 *
 * Why this matters:
 *   The AI cost optimizer relies on Prometheus as its metrics source.
 *   If Prometheus is not installed, no recommendations can be generated.
 *   This hook powers the "Monitoring Status" card on ClusterDetails.
 *
 * When to use:
 *   Call inside ClusterDetails (or any cluster-scoped page) alongside
 *   useClusterConnect. The hook fires automatically on mount.
 */
export function usePrometheusStatus(
  clusterName: string,
  roleArn?: string
): DataHookResult<PrometheusStatus> {
  const [data, setData]       = useState<PrometheusStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!clusterName) return
    setLoading(true)
    setError(null)

    const response = await prometheusService.getStatus(clusterName, roleArn)

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setData(null)
      setError(response.error ?? 'Failed to fetch Prometheus status')
    }

    setLoading(false)
  }, [clusterName, roleArn])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
