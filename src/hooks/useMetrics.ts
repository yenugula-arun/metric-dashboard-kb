import { useState, useEffect, useCallback } from 'react'
import { activityService } from '@/api/activity/activityService'
import type { ChartSeries, DataHookResult } from '@/types'

/**
 * useMetrics — fetches chart/metric data (CPU, memory, network).
 * Extracted from useActivity per the hook specification in UI.README.md.
 *
 * @param type - The metric type to fetch
 */
export function useMetrics(type: 'cpu' | 'memory' | 'network'): DataHookResult<ChartSeries[]> {
  const [data, setData]       = useState<ChartSeries[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    let response
    if (type === 'cpu')         response = await activityService.getCPUChartData()
    else if (type === 'memory') response = await activityService.getMemoryChartData()
    else                        response = await activityService.getNetworkChartData()

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setError(response.error ?? 'Failed to load metrics')
    }

    setLoading(false)
  }, [type])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
