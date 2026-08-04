import { useState, useEffect, useCallback } from 'react'
import { clusterService } from '@/api/cluster/clusterService'
import type { ClusterOverview, DataHookResult } from '@/types'

/**
 * useCluster — fetches cluster overview data.
 * UI components should consume this hook, not clusterService directly.
 */
export function useCluster(): DataHookResult<ClusterOverview> {
  const [data, setData]       = useState<ClusterOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await clusterService.getClusterOverview()

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setData(null)
      setError(response.error ?? 'Failed to load cluster data')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
