export type DeploymentStatus = 'running' | 'degraded' | 'failed' | 'pending' | 'unknown'

export interface DeploymentRow {
  id:               string
  name:             string
  namespace:        string
  replicas:         number
  availableReplicas: number
  cpuUsage:         string   // e.g. "250m"
  memoryUsage:      string   // e.g. "512Mi"
  cpuPercent:       number   // 0–100
  memoryPercent:    number   // 0–100
  status:           DeploymentStatus
  requestsPerSec:   number
  restartCount?:    number   // Specified in API.README.md
  monthlyCostUSD?:  number   // Specified in API.README.md
  lastUpdated:      string   // ISO 8601
}
