import { BaseService } from '@/api/core/baseService'
import { API_ROUTES }  from '@/api/core/apiRoutes'
import type {
  APIResponse,
  MetricsOverview,
  CpuUsage,
  MemoryUsage,
  PodCpuEntry,
  PodMemoryEntry,
  NodeCpuEntry,
  NodeMemoryEntry,
} from '@/types'
import axiosInstance from '@/api/core/axiosInstance'

/**
 * MetricsService
 *
 * Handles GET /metrics/* endpoints. These routes are proxied directly
 * to the ELB (not under /api/v1) — the vite proxy handles the rewrite.
 *
 * All CPU/memory usage values may be null when Prometheus has no data.
 */
class MetricsService extends BaseService {
  /**
   * GET /metrics/overview
   * Returns combined CPU/memory usage + top pods by both metrics.
   */
  async getOverview(): Promise<APIResponse<MetricsOverview>> {
    try {
      const response = await axiosInstance.get<MetricsOverview>(
        API_ROUTES.METRICS.OVERVIEW,
        { baseURL: '' }   // bypass /api/v1 — use the raw proxy path
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<MetricsOverview>(err)
    }
  }

  /** GET /metrics/cpu */
  async getCpu(): Promise<APIResponse<CpuUsage>> {
    try {
      const response = await axiosInstance.get<CpuUsage>(
        API_ROUTES.METRICS.CPU,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<CpuUsage>(err)
    }
  }

  /** GET /metrics/memory */
  async getMemory(): Promise<APIResponse<MemoryUsage>> {
    try {
      const response = await axiosInstance.get<MemoryUsage>(
        API_ROUTES.METRICS.MEMORY,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<MemoryUsage>(err)
    }
  }

  /** GET /metrics/pods/cpu — ranked list of pods by CPU millicores */
  async getPodsCpu(): Promise<APIResponse<PodCpuEntry[]>> {
    try {
      const response = await axiosInstance.get<PodCpuEntry[]>(
        API_ROUTES.METRICS.PODS_CPU,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<PodCpuEntry[]>(err)
    }
  }

  /** GET /metrics/pods/memory — ranked list of pods by memory MiB */
  async getPodsMemory(): Promise<APIResponse<PodMemoryEntry[]>> {
    try {
      const response = await axiosInstance.get<PodMemoryEntry[]>(
        API_ROUTES.METRICS.PODS_MEMORY,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<PodMemoryEntry[]>(err)
    }
  }

  /** GET /metrics/nodes/cpu — ranked list of nodes by CPU millicores */
  async getNodesCpu(): Promise<APIResponse<NodeCpuEntry[]>> {
    try {
      const response = await axiosInstance.get<NodeCpuEntry[]>(
        API_ROUTES.METRICS.NODES_CPU,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<NodeCpuEntry[]>(err)
    }
  }

  /** GET /metrics/nodes/memory — ranked list of nodes by memory MiB */
  async getNodesMemory(): Promise<APIResponse<NodeMemoryEntry[]>> {
    try {
      const response = await axiosInstance.get<NodeMemoryEntry[]>(
        API_ROUTES.METRICS.NODES_MEMORY,
        { baseURL: '' }
      )
      return { success: true, data: response.data }
    } catch (err) {
      return this.exposeError<NodeMemoryEntry[]>(err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private exposeError<T>(err: unknown): APIResponse<T> {
    if (err instanceof Error) {
      return { success: false, data: null, error: err.message }
    }
    return { success: false, data: null, error: 'Unknown error' }
  }
}

export const metricsService = new MetricsService()
