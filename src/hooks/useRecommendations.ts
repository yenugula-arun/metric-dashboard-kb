import { useState, useEffect, useCallback } from 'react'
import { recommendationService } from '@/api/recommendations/recommendationService'
import type { AIRecommendation, DataHookResult } from '@/types'

export function useRecommendations(): DataHookResult<AIRecommendation[]> & {
  approve: (id: string) => Promise<void>
  reject:  (id: string) => Promise<void>
} {
  const [data, setData]       = useState<AIRecommendation[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await recommendationService.getRecommendations()

    if (response.success && response.data) {
      setData(response.data)
    } else {
      setData(null)
      setError(response.error ?? 'Failed to load recommendations')
    }

    setLoading(false)
  }, [])

  const approve = useCallback(async (id: string) => {
    const response = await recommendationService.approveRecommendation(id)
    if (response.success) {
      // Optimistically update status in UI
      setData((prev) =>
        prev?.map((r) => r.id === id ? { ...r, status: 'approved' as const } : r) ?? null
      )
    }
  }, [])

  const reject = useCallback(async (id: string) => {
    const response = await recommendationService.rejectRecommendation(id)
    if (response.success) {
      setData((prev) =>
        prev?.map((r) => r.id === id ? { ...r, status: 'rejected' as const } : r) ?? null
      )
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData, approve, reject }
}
