import { BaseService } from '@/api/core/baseService'
import { API_ROUTES }  from '@/api/core/apiRoutes'
import type { APIResponse, PrometheusStatus, PrometheusInstallResult } from '@/types'

/**
 * PrometheusService
 * Handles POST /api/v1/prometheus/status & /install
 */
class PrometheusService extends BaseService {
  async getStatus(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<PrometheusStatus>> {
    return this.post<PrometheusStatus>(API_ROUTES.PROMETHEUS.STATUS, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }

  async install(
    clusterName: string,
    roleArn?: string
  ): Promise<APIResponse<PrometheusInstallResult>> {
    return this.post<PrometheusInstallResult>(API_ROUTES.PROMETHEUS.INSTALL, {
      clusterName,
      ...(roleArn ? { roleArn } : {}),
    })
  }
}

export const prometheusService = new PrometheusService()
