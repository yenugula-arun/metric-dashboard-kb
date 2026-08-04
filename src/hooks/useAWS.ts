import { useAWSContext } from '@/context/AWSContext'
import type { AWSConnection, DataHookResult } from '@/types'

/**
 * useAWS — consumes AWSContext for connection state and clusters.
 */
export function useAWS(): DataHookResult<AWSConnection> {
  const { connection, loading, error, refresh } = useAWSContext()
  return {
    data: connection,
    loading,
    error,
    refresh,
  }
}
