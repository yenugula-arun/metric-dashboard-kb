import { BaseService }           from '@/api/core/baseService'
import { API_ROUTES }            from '@/api/core/apiRoutes'
import type { APIResponse, ActivityEvent, ChartSeries } from '@/types'

class ActivityService extends BaseService {
  async getActivityEvents(): Promise<APIResponse<ActivityEvent[]>> {
    return this.get<ActivityEvent[]>(API_ROUTES.ACTIVITY.GET_ALL)
  }

  async getCPUChartData(): Promise<APIResponse<ChartSeries[]>> {
    return this.get<ChartSeries[]>(API_ROUTES.CLUSTER.METRICS)
  }

  async getMemoryChartData(): Promise<APIResponse<ChartSeries[]>> {
    return this.get<ChartSeries[]>(API_ROUTES.CLUSTER.METRICS)
  }

  async getNetworkChartData(): Promise<APIResponse<ChartSeries[]>> {
    return this.get<ChartSeries[]>(API_ROUTES.CLUSTER.METRICS)
  }
}

export const activityService = new ActivityService()
