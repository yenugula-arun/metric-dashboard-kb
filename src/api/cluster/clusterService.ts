import { BaseService } from '@/api/core/baseService'
import { API_ROUTES }  from '@/api/core/apiRoutes'
import type { APIResponse, ClusterOverview } from '@/types'

class ClusterService extends BaseService {
  /**
   * Fetch the cluster overview summary.
   * Connects to backend endpoint /api/v1/cluster/summary
   */
  async getClusterOverview(): Promise<APIResponse<ClusterOverview>> {
    return this.get<ClusterOverview>(API_ROUTES.CLUSTER.SUMMARY)
  }
}

export const clusterService = new ClusterService()
