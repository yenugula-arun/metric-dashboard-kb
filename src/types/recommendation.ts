export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'done'
export type RecommendationConfidence = 'high' | 'medium' | 'low'

export interface AIRecommendation {
  id:                   string
  serviceName:          string
  namespace:            string
  currentReplicas:      number
  recommendedReplicas:  number
  confidence:           RecommendationConfidence
  confidenceScore:      number   // 0–100
  reason:               string
  estimatedSavingsUSD:  number   // monthly
  status:               RecommendationStatus
  createdAt:            string   // ISO 8601
}
