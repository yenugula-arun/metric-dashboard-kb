/**
 * Types matching the backend contract for GET /metrics/* endpoints.
 *
 * CPU/memory usage values can be null when Prometheus has no data yet.
 */

/** A single pod entry in the top-CPU or top-memory list */
export interface PodCpuEntry {
  pod:            string
  cpu_millicores: number
}

export interface PodMemoryEntry {
  pod:        string
  memory_mib: number
}

/** GET /metrics/cpu */
export interface CpuUsage {
  cpu_usage: number | null
  unit:      string
}

/** GET /metrics/memory */
export interface MemoryUsage {
  memory_usage: number | null
  unit:         string
}

/** GET /metrics/overview */
export interface MetricsOverview {
  cpu:              CpuUsage
  memory:           MemoryUsage
  top_cpu_pods:     PodCpuEntry[]
  top_memory_pods:  PodMemoryEntry[]
}

/** GET /metrics/nodes/cpu */
export interface NodeCpuEntry {
  instance:        string
  cpu_millicores?: number
  memory_mib?:     number
}

/** GET /metrics/nodes/memory */
export interface NodeMemoryEntry {
  instance:        string
  memory_mib?:     number
  cpu_millicores?: number
}

/** POST /api/v1/prometheus/install response */
export interface PrometheusInstallResult {
  success:    boolean
  message:    string
  prometheus: {
    installed:  boolean
    healthy:    boolean
    namespace:  boolean
    service:    boolean
    deployment: boolean
  }
}
