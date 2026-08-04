export type ActivityEventType =
  | 'deployment_restarted'
  | 'deployment_scaled'
  | 'node_unhealthy'
  | 'pod_crashed'
  | 'pod_evicted'
  | 'recommendation_created'
  | 'recommendation_approved'
  | 'recommendation_rejected'
  | 'traffic_spike'
  | 'cost_alert'
  | 'cluster_event'

export type ActivitySeverity = 'info' | 'warning' | 'critical' | 'success'

export interface ActivityEvent {
  id:          string
  type:        ActivityEventType
  title:       string
  description: string
  namespace:   string
  resource:    string
  severity:    ActivitySeverity
  timestamp:   string   // ISO 8601
}

/** Time-series data point for charts */
export interface MetricDataPoint {
  timestamp: string   // e.g. "14:30"
  value:     number
}

export interface ChartSeries {
  name:   string
  data:   MetricDataPoint[]
  color?: string
}
