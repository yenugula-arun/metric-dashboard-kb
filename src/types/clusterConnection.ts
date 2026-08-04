/**
 * Types matching the backend contract for POST /api/v1/clusters/connect, /pods & /nodes.
 */

export interface ClusterConnection {
  connected:  boolean
  cluster:    string
  namespaces: string[]
}

/** Request body for POST /api/v1/clusters/connect */
export interface ClusterConnectRequest {
  roleArn:     string
  clusterName: string
}

export interface K8sNamespaceItem {
  metadata?: {
    name?: string
  }
}

export interface K8sNamespaceList {
  items?: K8sNamespaceItem[]
}

export interface K8sServiceItem {
  metadata?: {
    name?: string
  }
}

export interface K8sServiceList {
  items?: K8sServiceItem[]
}

export interface K8sContainerStatus {
  name?: string
  ready?: boolean
  restartCount?: number
  image?: string
  state?: {
    running?: {
      startedAt?: string
    }
    waiting?: {
      reason?: string
      message?: string
    }
    terminated?: {
      reason?: string
      exitCode?: number
    }
  }
}

export interface K8sPodItem {
  metadata?: {
    name?: string
    generateName?: string
    namespace?: string
    uid?: string
    creationTimestamp?: string
    labels?: Record<string, string>
    annotations?: Record<string, string>
    ownerReferences?: Array<{ apiVersion?: string; kind?: string; name?: string; uid?: string }>
  }
  spec?: {
    nodeName?: string
    serviceAccountName?: string
    containers?: Array<{
      name?: string
      image?: string
      ports?: Array<{ containerPort?: number; name?: string; protocol?: string }>
      resources?: unknown
    }>
  }
  status?: {
    phase?: string
    hostIP?: string
    podIP?: string
    startTime?: string
    containerStatuses?: K8sContainerStatus[]
  }
}

export interface K8sPodList {
  kind?: string
  apiVersion?: string
  metadata?: {
    resourceVersion?: string
  }
  items?: K8sPodItem[]
}

export interface K8sNodeItem {
  metadata?: {
    name?: string
    uid?: string
    creationTimestamp?: string
    labels?: Record<string, string>
  }
  status?: {
    addresses?: Array<{ type?: string; address?: string }>
    capacity?: Record<string, string>
    allocatable?: Record<string, string>
    nodeInfo?: {
      architecture?: string
      containerRuntimeVersion?: string
      kubeletVersion?: string
      operatingSystem?: string
      osImage?: string
    }
    conditions?: Array<{
      type?: string
      status?: string
      reason?: string
      message?: string
    }>
  }
}

export interface K8sNodeList {
  kind?: string
  apiVersion?: string
  items?: K8sNodeItem[]
}

export interface NodeDetailInfo {
  name: string
  hostIP: string
  status: string
  podCount: number
  pods: K8sPodItem[]
  architecture?: string
  kubeletVersion?: string
}
