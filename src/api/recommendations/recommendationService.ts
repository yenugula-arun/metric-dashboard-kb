import { BaseService }              from '@/api/core/baseService'
import { API_ROUTES }               from '@/api/core/apiRoutes'
import type { APIResponse, AIRecommendation } from '@/types'

class RecommendationService extends BaseService {
  async getRecommendations(): Promise<APIResponse<AIRecommendation[]>> {
    return this.get<AIRecommendation[]>(API_ROUTES.RECOMMENDATIONS.GET_ALL)
  }

  async approveRecommendation(id: string): Promise<APIResponse<void>> {
    return this.post<void>(API_ROUTES.RECOMMENDATIONS.APPROVE(id))
  }

  async rejectRecommendation(id: string): Promise<APIResponse<void>> {
    return this.post<void>(API_ROUTES.RECOMMENDATIONS.REJECT(id))
  }
}

export const recommendationService = new RecommendationService()
