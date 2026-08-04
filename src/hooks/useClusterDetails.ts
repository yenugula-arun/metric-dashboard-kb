import { useMemo }   from 'react'
import { useAWS }    from './useAWS'
import type { EKSCluster, DataHookResult } from '@/types'

interface ClusterDetailsResult extends Omit<DataHookResult<EKSCluster>, 'data'> {
  cluster:   EKSCluster | null
  accountId: string | null
}

/**
 * useClusterDetails — resolves a single cluster by name from the clusters list.
 * Re-uses the existing useClusters hook — no additional API call is made.
 *
 * @param clusterName — the :clusterName URL param (e.g. "ai-cost-optimizer")
 */
export function useClusterDetails(clusterName: string): ClusterDetailsResult {
  const { data, loading, error, refresh } = useAWS()

  const cluster = useMemo(() => {
    if (!data) return null
    return data.clusters.find((c) => c.name === clusterName) ?? null
  }, [data, clusterName])

  return {
    cluster,
    accountId: data?.accountId ?? null,
    loading,
    error,
    refresh,
  }
}
