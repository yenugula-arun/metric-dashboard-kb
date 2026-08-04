import { useState, useEffect, useCallback } from 'react'
import { clusterConnectService } from '@/api/cluster/clusterConnectService'
import type { ClusterConnection, K8sPodItem, NodeDetailInfo, DataHookResult } from '@/types'

export interface ExtendedClusterConnection extends ClusterConnection {
  pods: K8sPodItem[]
  totalPods: number
  uniqueNodes: string[]
  totalNodes: number
  namespacePodCounts: Record<string, number>
  nodeDetails: NodeDetailInfo[]
}

/**
 * useClusterConnect — Handles connection, namespace discovery, pods, and node inventory.
 */
export function useClusterConnect(
  clusterName: string,
  roleArn?: string
): DataHookResult<ExtendedClusterConnection> {
  const [data, setData]       = useState<ExtendedClusterConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!clusterName) return
    setLoading(true)
    setError(null)

    const [connectRes, nsRes, podsRes, nodesRes] = await Promise.all([
      clusterConnectService.connect(clusterName, roleArn),
      clusterConnectService.getNamespaces(clusterName, roleArn),
      clusterConnectService.getPods(clusterName, roleArn),
      clusterConnectService.getNodes(clusterName, roleArn),
    ])

    let extractedNamespaces: string[] = []
    if (nsRes.success && nsRes.data && Array.isArray(nsRes.data.items)) {
      extractedNamespaces = nsRes.data.items
        .map((item: { metadata?: { name?: string } }) => item.metadata?.name)
        .filter(Boolean) as string[]
    } else if (connectRes.success && connectRes.data?.namespaces) {
      extractedNamespaces = connectRes.data.namespaces
    }

    const pods: K8sPodItem[] = (podsRes.success && podsRes.data?.items) ? podsRes.data.items : []

    // Build node to pods map and node IP map
    const nodePodsMap: Record<string, K8sPodItem[]> = {}
    const nodeIpMap: Record<string, string> = {}
    const namespacePodCounts: Record<string, number> = {}

    for (const pod of pods) {
      const nodeName = pod.spec?.nodeName || pod.status?.hostIP || 'Unassigned'
      const hostIp = pod.status?.hostIP || ''

      if (!nodePodsMap[nodeName]) {
        nodePodsMap[nodeName] = []
      }
      nodePodsMap[nodeName].push(pod)

      if (hostIp && nodeName !== 'Unassigned') {
        nodeIpMap[nodeName] = hostIp
      }

      const ns = pod.metadata?.namespace || 'default'
      namespacePodCounts[ns] = (namespacePodCounts[ns] || 0) + 1
    }

    // Build NodeDetailInfo array
    const rawNodes = (nodesRes.success && nodesRes.data?.items) ? nodesRes.data.items : []
    const nodeDetails: NodeDetailInfo[] = []

    if (rawNodes.length > 0) {
      for (const item of rawNodes) {
        const name = item.metadata?.name || 'unknown'
        const internalIp = item.status?.addresses?.find(a => a.type === 'InternalIP')?.address || nodeIpMap[name] || '—'
        const readyCond = item.status?.conditions?.find(c => c.type === 'Ready')?.status === 'True'
        const statusStr = readyCond ? 'Ready' : 'NotReady'
        const podList = nodePodsMap[name] || []

        nodeDetails.push({
          name,
          hostIP: internalIp,
          status: statusStr,
          podCount: podList.length,
          pods: podList,
          architecture: item.status?.nodeInfo?.architecture,
          kubeletVersion: item.status?.nodeInfo?.kubeletVersion,
        })
      }
    } else {
      // Fallback from pods node names
      const uniqueNodeNames = Object.keys(nodePodsMap)
      for (const nodeName of uniqueNodeNames) {
        const podList = nodePodsMap[nodeName] || []
        const hostIp = podList.find(p => p.status?.hostIP)?.status?.hostIP || nodeIpMap[nodeName] || '—'

        nodeDetails.push({
          name: nodeName,
          hostIP: hostIp,
          status: 'Ready',
          podCount: podList.length,
          pods: podList,
        })
      }
    }

    const uniqueNodes = nodeDetails.map(n => n.name)
    const isConnected = connectRes.success ? (connectRes.data?.connected ?? true) : false

    if (connectRes.success || nsRes.success || podsRes.success || nodesRes.success) {
      const finalNamespaces = Array.from(new Set([
        ...extractedNamespaces,
        ...Object.keys(namespacePodCounts),
        'default',
      ]))

      setData({
        connected:  isConnected,
        cluster:    clusterName,
        namespaces: finalNamespaces,
        pods,
        totalPods:  pods.length,
        uniqueNodes,
        totalNodes: nodeDetails.length,
        namespacePodCounts,
        nodeDetails,
      })
    } else {
      setData(null)
      setError(connectRes.error ?? nsRes.error ?? podsRes.error ?? 'Failed to connect to cluster')
    }

    setLoading(false)
  }, [clusterName, roleArn])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refresh: fetchData }
}
