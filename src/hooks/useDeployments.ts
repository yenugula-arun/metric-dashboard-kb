import { useState, useEffect, useCallback } from 'react'
import { deploymentService } from '@/api/deployments/deploymentService'
import type { DeploymentRow, DataHookResult } from '@/types'

export interface DeploymentSummaryStats {
  total: number
  running: number
  degraded: number
  failed: number
  pending: number
  availableReplicas: number
  targetReplicas: number
}

export interface ExtendedDeploymentsResult {
  deployments: DeploymentRow[]
  summary: DeploymentSummaryStats
  namespaces: string[]
}

export function useDeployments(
  clusterName?: string,
  roleArn?: string
): DataHookResult<ExtendedDeploymentsResult> {
  const [data, setData]       = useState<ExtendedDeploymentsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await deploymentService.getDeployments(clusterName, roleArn)

    if (response.success && response.data) {
      const deps = response.data

      const total = deps.length
      const running = deps.filter(d => d.status === 'running').length
      const degraded = deps.filter(d => d.status === 'degraded').length
      const failed = deps.filter(d => d.status === 'failed').length
      const pending = deps.filter(d => d.status === 'pending').length

      const availableReplicas = deps.reduce((sum, d) => sum + (d.availableReplicas || 0), 0)
      const targetReplicas    = deps.reduce((sum, d) => sum + (d.replicas || 0), 0)

      const namespaces = Array.from(new Set(deps.map(d => d.namespace))).sort()

      setData({
        deployments: deps,
        summary: {
          total,
          running,
          degraded,
          failed,
          pending,
          availableReplicas,
          targetReplicas,
        },
        namespaces,
      })
    } else {
      setData(null)
      setError(response.error ?? 'Failed to load deployments')
    }

    setLoading(false)
  }, [clusterName, roleArn])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
