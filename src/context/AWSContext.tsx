import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { awsService } from '@/api/aws/awsService'
import type { AWSConnection } from '@/types'

interface AWSContextType {
  roleArn: string
  connection: AWSConnection | null
  isConnected: boolean
  loading: boolean
  error: string | null
  connect: (arn: string) => Promise<boolean>
  disconnect: () => void
  refresh: () => Promise<void>
}

const STORAGE_KEY = 'aws_role_arn'

const AWSContext = createContext<AWSContextType | undefined>(undefined)

export function AWSProvider({ children }: { children: ReactNode }) {
  const [roleArn, setRoleArn] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  })
  const [connection, setConnection] = useState<AWSConnection | null>(null)
  const [loading, setLoading]       = useState<boolean>(() => Boolean(localStorage.getItem(STORAGE_KEY)))
  const [error, setError]           = useState<string | null>(null)

  const fetchConnection = useCallback(async (arnToConnect: string) => {
    if (!arnToConnect.trim()) {
      setConnection(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const res = await awsService.connect(arnToConnect)

    if (res.success && res.data) {
      setConnection(res.data)
      setRoleArn(arnToConnect)
      localStorage.setItem(STORAGE_KEY, arnToConnect)
    } else {
      setConnection(null)
      setError(res.error ?? 'Failed to connect to AWS with the provided Role ARN')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (roleArn) {
      void fetchConnection(roleArn)
    } else {
      setLoading(false)
    }
  }, [roleArn, fetchConnection])

  const connect = useCallback(async (newArn: string): Promise<boolean> => {
    const trimmed = newArn.trim()
    if (!trimmed) {
      setError('Please provide a valid AWS Role ARN.')
      return false
    }
    setLoading(true)
    setError(null)
    const res = await awsService.connect(trimmed)
    if (res.success && res.data) {
      setConnection(res.data)
      setRoleArn(trimmed)
      localStorage.setItem(STORAGE_KEY, trimmed)
      setLoading(false)
      return true
    } else {
      setConnection(null)
      setError(res.error ?? 'Failed to connect to AWS with the provided Role ARN.')
      setLoading(false)
      return false
    }
  }, [])

  const disconnect = useCallback(() => {
    setRoleArn('')
    setConnection(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const refresh = useCallback(async () => {
    if (roleArn) {
      await fetchConnection(roleArn)
    }
  }, [roleArn, fetchConnection])

  return (
    <AWSContext.Provider
      value={{
        roleArn,
        connection,
        isConnected: Boolean(connection && roleArn),
        loading,
        error,
        connect,
        disconnect,
        refresh,
      }}
    >
      {children}
    </AWSContext.Provider>
  )
}

export function useAWSContext() {
  const ctx = useContext(AWSContext)
  if (!ctx) {
    throw new Error('useAWSContext must be used within an AWSProvider')
  }
  return ctx
}
