import { BaseService }          from '@/api/core/baseService'
import { API_ROUTES }           from '@/api/core/apiRoutes'
import { clusterConnectService } from '@/api/cluster/clusterConnectService'
import { metricsService }        from '@/api/cluster/metricsService'
import type { APIResponse, DeploymentRow, K8sPodItem, PodCpuEntry, PodMemoryEntry } from '@/types'

/**
 * Parses real Kubernetes pods and live Prometheus metrics into DeploymentRow objects.
 */
export function extractRealDeploymentsFromPods(
  pods: K8sPodItem[],
  _knownNamespaces?: string[],
  podsCpu?: PodCpuEntry[],
  podsMemory?: PodMemoryEntry[]
): DeploymentRow[] {
  const map = new Map<string, {
    name: string
    namespace: string
    pods: K8sPodItem[]
    totalReplicas: number
    availableReplicas: number
    restartCount: number
    createdTime: string
  }>()

  // Map pod name -> real CPU millicores & Memory MiB
  const podCpuMap = new Map<string, number>()
  const podMemMap = new Map<string, number>()

  if (Array.isArray(podsCpu)) {
    for (const item of podsCpu) {
      if (item.pod && typeof item.cpu_millicores === 'number') {
        podCpuMap.set(item.pod, item.cpu_millicores)
      }
    }
  }

  if (Array.isArray(podsMemory)) {
    for (const item of podsMemory) {
      if (item.pod && typeof item.memory_mib === 'number') {
        podMemMap.set(item.pod, item.memory_mib)
      }
    }
  }

  function getDeploymentName(pod: K8sPodItem): string {
    const labels = pod.metadata?.labels || {}
    if (labels['app.kubernetes.io/name']) return labels['app.kubernetes.io/name']
    if (labels['app.kubernetes.io/instance']) return labels['app.kubernetes.io/instance']
    if (labels['app']) return labels['app']

    const owner = pod.metadata?.ownerReferences?.[0]
    if (owner?.name) {
      const name = owner.name
      const parts = name.split('-')
      if (parts.length > 1 && parts[parts.length - 1].length >= 5 && /^[a-f0-9]+$/i.test(parts[parts.length - 1])) {
        return parts.slice(0, parts.length - 1).join('-')
      }
      return name
    }

    if (pod.metadata?.generateName) {
      const gen = pod.metadata.generateName.replace(/-$/, '')
      const parts = gen.split('-')
      if (parts.length > 1 && parts[parts.length - 1].length >= 5 && /^[a-f0-9]+$/i.test(parts[parts.length - 1])) {
        return parts.slice(0, parts.length - 1).join('-')
      }
      return gen
    }

    const podName = pod.metadata?.name || 'cluster-workload'
    const parts = podName.split('-')
    if (parts.length > 2) {
      return parts.slice(0, parts.length - 2).join('-')
    }
    return podName
  }

  for (const pod of pods) {
    const ns = pod.metadata?.namespace || 'default'
    const depName = getDeploymentName(pod)
    const key = `${ns}/${depName}`

    const isRunning = pod.status?.phase === 'Running'
    const restarts = (pod.status?.containerStatuses || []).reduce((s, c) => s + (c.restartCount || 0), 0)
    const created = pod.metadata?.creationTimestamp || new Date().toISOString()

    if (!map.has(key)) {
      map.set(key, {
        name: depName,
        namespace: ns,
        pods: [pod],
        totalReplicas: 1,
        availableReplicas: isRunning ? 1 : 0,
        restartCount: restarts,
        createdTime: created,
      })
    } else {
      const entry = map.get(key)!
      entry.pods.push(pod)
      entry.totalReplicas += 1
      if (isRunning) entry.availableReplicas += 1
      entry.restartCount += restarts
      // Keep earliest creation timestamp
      if (new Date(created) < new Date(entry.createdTime)) {
        entry.createdTime = created
      }
    }
  }

  const results: DeploymentRow[] = []
  let index = 1

  map.forEach((entry) => {
    const isFull = entry.availableReplicas === entry.totalReplicas
    const isPartial = entry.availableReplicas > 0
    const status = isFull ? 'running' : isPartial ? 'degraded' : 'failed'

    // Calculate real live CPU & Memory usage from Prometheus metrics
    let totalCpuM = 0
    let totalMemMi = 0
    let hasRealCpu = false
    let hasRealMem = false

    for (const pod of entry.pods) {
      const podName = pod.metadata?.name ?? ''
      if (podCpuMap.has(podName)) {
        totalCpuM += podCpuMap.get(podName)!
        hasRealCpu = true
      }
      if (podMemMap.has(podName)) {
        totalMemMi += podMemMap.get(podName)!
        hasRealMem = true
      }
    }

    // Use actual CPU/memory values if present from Prometheus, otherwise default to 0
    const finalCpuM = hasRealCpu ? totalCpuM : 0
    const finalMemMi = hasRealMem ? totalMemMi : 0

    const containerCount = entry.pods.reduce((sum, p) => sum + (p.spec?.containers?.length || 1), 0)
    const cpuPct = containerCount > 0 ? Math.min(Math.round((finalCpuM / (containerCount * 500)) * 100), 100) : 0
    const memPct = containerCount > 0 ? Math.min(Math.round((finalMemMi / (containerCount * 512)) * 100), 100) : 0

    results.push({
      id: `dep-${String(index).padStart(3, '0')}`,
      name: entry.name,
      namespace: entry.namespace,
      replicas: entry.totalReplicas,
      availableReplicas: entry.availableReplicas,
      cpuUsage: `${Math.round(finalCpuM)}m`,
      memoryUsage: `${Math.round(finalMemMi)}Mi`,
      cpuPercent: cpuPct,
      memoryPercent: memPct,
      status,
      requestsPerSec: 0,
      restartCount: entry.restartCount,
      monthlyCostUSD: 0,
      lastUpdated: entry.createdTime,
    })

    index++
  })

  return results
}

class DeploymentService extends BaseService {
  /**
   * Fetch all deployments based on real cluster pods, namespaces, and Prometheus metrics.
   */
  async getDeployments(
    clusterName?: string,
    roleArn?: string
  ): Promise<APIResponse<DeploymentRow[]>> {
    try {
      if (clusterName) {
        const clusterRes = await this.post<DeploymentRow[]>(API_ROUTES.CLUSTER.DEPLOYMENTS, {
          clusterName,
          ...(roleArn ? { roleArn } : {}),
        })
        if (clusterRes.success && Array.isArray(clusterRes.data) && clusterRes.data.length > 0) {
          return clusterRes
        }
      }

      // Fetch live pods, namespaces, and Prometheus CPU & Memory metrics in parallel
      const targetCluster = clusterName || ''
      const [podsRes, nsRes, cpuRes, memRes] = await Promise.all([
        clusterConnectService.getPods(targetCluster, roleArn),
        clusterConnectService.getNamespaces(targetCluster, roleArn),
        metricsService.getPodsCpu(),
        metricsService.getPodsMemory(),
      ])

      const livePods = (podsRes.success && podsRes.data?.items) ? podsRes.data.items : []
      let extractedNs: string[] = []

      if (nsRes.success && nsRes.data?.items) {
        extractedNs = nsRes.data.items.map(i => i.metadata?.name).filter(Boolean) as string[]
      }

      const liveCpu = (cpuRes.success && Array.isArray(cpuRes.data)) ? cpuRes.data : []
      const liveMem = (memRes.success && Array.isArray(memRes.data)) ? memRes.data : []

      const realDeployments = extractRealDeploymentsFromPods(livePods, extractedNs, liveCpu, liveMem)
      return { success: true, data: realDeployments }

    } catch (err) {
      return {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : 'Failed to fetch deployments',
      }
    }
  }

  async getDeploymentById(
    name: string,
    clusterName?: string,
    roleArn?: string
  ): Promise<APIResponse<DeploymentRow>> {
    const allRes = await this.getDeployments(clusterName, roleArn)
    if (allRes.success && allRes.data) {
      const found = allRes.data.find(d => d.name === name || d.id === name)
      if (found) return { success: true, data: found }
    }

    return { success: false, data: null, error: `Deployment "${name}" not found` }
  }
}

export const deploymentService = new DeploymentService()
