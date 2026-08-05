import axios                from 'axios'
import { API_ROUTES }       from '@/api/core/apiRoutes'
import type {
  AgentAnalyzeRequest,
  AgentAnalysisResult,
  AgentExecuteRequest,
  AgentExecutionResult,
} from '@/types'

/**
 * AgentService
 *
 * Two-agent cluster optimizer flow:
 *
 * Agent 1 — POST /analyze
 *   Request:  { cluster_name, role_arn }
 *   Response: Full AI analysis report (metrics, scheduling, cost, AI recommendations)
 *
 * Agent 2 — POST /execute
 *   Request:  { cluster_name, role_arn, target_node_count, approval, dry_run }
 *   Response: { operation_id, status, ... }
 *
 * Agent 2 poll — GET /executions/{operation_id}
 *   Response: Updated execution status (may return 404 on some deployments)
 */

const agentAxios = axios.create({
  baseURL: '',       // Vite proxy routes /analyze, /execute, /executions to ELB
  timeout: 60_000,   // 60s — agent runs synchronously through multiple steps
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

class AgentService {
  /**
   * Agent 1: Run AI cluster analysis.
   * Returns full analysis report with metrics, scheduling data, cost, and AI recommendations.
   */
  async analyze(body: AgentAnalyzeRequest): Promise<AgentAnalysisResult> {
    const res = await agentAxios.post<AgentAnalysisResult>(
      API_ROUTES.AGENT.ANALYZE,
      body
    )
    return res.data
  }

  /**
   * Agent 2: Execute the optimization.
   * Submits node termination with approval. May return minimal or full result.
   */
  async execute(body: AgentExecuteRequest): Promise<AgentExecutionResult> {
    const res = await agentAxios.post<AgentExecutionResult>(
      API_ROUTES.AGENT.EXECUTE,
      body
    )
    return res.data
  }

  /**
   * Agent 2 poll: Get execution status.
   * Returns null on 404 (server may not support polling or operation has expired).
   */
  async getExecution(operationId: string): Promise<AgentExecutionResult | null> {
    try {
      const res = await agentAxios.get<AgentExecutionResult>(
        API_ROUTES.AGENT.GET_EXECUTION(operationId)
      )
      return res.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null
      }
      throw err
    }
  }
}

export const agentService = new AgentService()
