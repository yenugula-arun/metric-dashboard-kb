export type ClusterHealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown'

export interface ClusterOverview {
  clusterId:              string
  clusterName:            string
  provider:               string
  region:                 string
  k8sVersion:             string
  healthStatus:           ClusterHealthStatus
  cpuUsagePercent:        number
  memoryUsagePercent:     number
  totalCPUCores:          number
  usedCPUCores:           number
  totalMemoryGiB:         number
  usedMemoryGiB:          number
  runningPods:            number
  totalPods:              number
  totalDeployments:       number
  healthyDeployments:     number
  pendingRecommendations: number
  nodeCount:              number
  lastUpdated:            string
}

/** Raw Kubernetes Namespace Item */
export interface K8sNamespaceItem {
  metadata: {
    name: string
    uid?: string
    creationTimestamp?: string
    labels?: Record<string, string>
  }
  status?: {
    phase?: string
  }
}

/** Response from POST /api/v1/clusters/namespaces */
export interface K8sNamespaceList {
  kind: 'NamespaceList'
  apiVersion: string
  items: K8sNamespaceItem[]
}

/** Raw Kubernetes Service Item */
export interface K8sServiceItem {
  metadata: {
    name: string
    namespace: string
    uid?: string
    creationTimestamp?: string
    labels?: Record<string, string>
  }
  spec?: {
    type?: string
    clusterIP?: string
    ports?: Array<{
      name?: string
      port: number
      targetPort?: number | string
      protocol?: string
    }>
  }
  status?: {
    loadBalancer?: {
      ingress?: Array<{
        hostname?: string
        ip?: string
      }>
    }
  }
}

/** Response from POST /api/v1/clusters/services */
export interface K8sServiceList {
  kind: 'ServiceList'
  apiVersion: string
  items: K8sServiceItem[]
}
