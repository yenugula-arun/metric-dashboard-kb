import { BaseService } from '@/api/core/baseService'
import { API_ROUTES }  from '@/api/core/apiRoutes'
import type {
  APIResponse,
  ClusterConnection,
  K8sNamespaceList,
  K8sServiceList,
  K8sPodList,
  K8sNodeList,
} from '@/types'

/**
 * ClusterConnectService
 *
 * Handles POST /api/v1/clusters/* endpoints:
 *  - /clusters/connect
 *  - /clusters/namespaces
 *  - /clusters/services
 *  - /clusters/pods
 *  - /clusters/nodes
 */
class ClusterConnectService extends BaseService {
  /** Connect to a specific EKS cluster */
  async connect(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<ClusterConnection>> {
    return this.post<ClusterConnection>(API_ROUTES.CLUSTER.CONNECT, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }

  /** Fetch full K8s NamespaceList via POST /api/v1/clusters/namespaces */
  async getNamespaces(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<K8sNamespaceList>> {
    return this.post<K8sNamespaceList>(API_ROUTES.CLUSTER.NAMESPACES, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }

  /** Fetch full K8s ServiceList via POST /api/v1/clusters/services */
  async getServices(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<K8sServiceList>> {
    return this.post<K8sServiceList>(API_ROUTES.CLUSTER.SERVICES, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }

  /** Fetch full K8s PodList via POST /api/v1/clusters/pods */
  async getPods(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<K8sPodList>> {
    return this.post<K8sPodList>(API_ROUTES.CLUSTER.PODS, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }

  /** Fetch full K8s NodeList via POST /api/v1/clusters/nodes */
  async getNodes(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<K8sNodeList>> {
    return this.post<K8sNodeList>(API_ROUTES.CLUSTER.NODES, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }
}

export const clusterConnectService = new ClusterConnectService()
