import { useState, useEffect, useCallback } from 'react'
import { activityService } from '@/api/activity/activityService'
import type { ActivityEvent, DataHookResult } from '@/types'

/**
 * useActivity — fetches the activity event feed.
 * UI components must consume this hook — never call activityService directly.
 *
 * For chart/metric data use useMetrics (useChartData) instead.
 */
export function useActivity(): DataHookResult<ActivityEvent[]> {
  const [data, setData]       = useState<ActivityEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await activityService.getActivityEvents()

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setData(null)
      setError(response.error ?? 'Failed to load activity logs')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
