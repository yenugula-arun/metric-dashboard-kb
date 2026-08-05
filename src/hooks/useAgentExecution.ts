import { useState, useEffect, useRef, useCallback } from 'react'
import { agentService }        from '@/api/agent/agentService'
import type {
  AgentAnalysisResult,
  AgentExecutionResult,
  AgentExecutionStatus,
} from '@/types'

const POLL_INTERVAL_MS   = 5_000
const MAX_404_RETRIES    = 12         // Keep polling for up to 60 seconds of consecutive 404s
const TERMINAL_STATUSES: AgentExecutionStatus[] = ['COMPLETED', 'FAILED']

export type AgentFlowPhase =
  | 'idle'
  | 'analysing'    // POST /analyze in-flight
  | 'analysed'     // analysis result received
  | 'executing'    // POST /execute in-flight
  | 'executed'     // execution submitted, polling active
  | 'completed'    // polling confirmed COMPLETED
  | 'error'

export interface UseAgentFlowState {
  phase:          AgentFlowPhase
  analysisResult: AgentAnalysisResult | null
  execResult:     AgentExecutionResult | null
  operationId:    string | null
  execStatus:     AgentExecutionStatus | null
  isPolling:      boolean
  pollingStopped: boolean
  error:          string | null
}

interface UseAgentFlowReturn extends UseAgentFlowState {
  runAnalysis: (clusterName: string, roleArn: string) => Promise<void>
  runExecute:  (clusterName: string, roleArn: string, targetNodeCount: number) => Promise<void>
  reset:       () => void
}

const INITIAL_STATE: UseAgentFlowState = {
  phase:          'idle',
  analysisResult: null,
  execResult:     null,
  operationId:    null,
  execStatus:     null,
  isPolling:      false,
  pollingStopped: false,
  error:          null,
}

/**
 * useAgentFlow
 *
 * Two-phase agent flow with continuous live polling:
 * 1. runAnalysis()  → POST /analyze → sets analysisResult, phase='analysed'
 * 2. runExecute()   → POST /execute → polls GET /executions/{id} every 5s
 *                     Keeps polling animation active.
 *                     When completed, automatically re-runs analysis to update UI node count (e.g. 4 -> 3).
 */
export function useAgentFlow(): UseAgentFlowReturn {
  const [state, setState] = useState<UseAgentFlowState>(INITIAL_STATE)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const notFoundCountRef  = useRef<number>(0)
  const activeParamsRef   = useRef<{ clusterName: string; roleArn: string } | null>(null)

  const stopPolling = useCallback((stopped = true) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    notFoundCountRef.current = 0
    setState(prev => ({ ...prev, isPolling: false, pollingStopped: stopped }))
  }, [])

  // ── Agent 1: Analyse ─────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async (clusterName: string, roleArn: string) => {
    activeParamsRef.current = { clusterName, roleArn }
    setState(prev => ({
      ...prev,
      phase:          'analysing',
      error:          null,
    }))

    try {
      const result = await agentService.analyze({ cluster_name: clusterName, role_arn: roleArn })
      setState(prev => ({
        ...prev,
        phase:          prev.execResult ? prev.phase : 'analysed',
        analysisResult: result,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setState(prev => ({ ...prev, phase: 'error', error: message }))
    }
  }, [])

  const poll = useCallback(async (opId: string) => {
    try {
      const result = await agentService.getExecution(opId)

      if (result === null) {
        // 404 — increment counter; keep polling for up to MAX_404_RETRIES (60s)
        notFoundCountRef.current += 1
        if (notFoundCountRef.current >= MAX_404_RETRIES) {
          stopPolling(true)
        }
        return
      }

      // Got real response — reset consecutive 404 counter
      notFoundCountRef.current = 0
      const isTerminal = TERMINAL_STATUSES.includes(result.status)

      setState(prev => ({
        ...prev,
        execResult:  result,
        execStatus:  result.status,
        phase:       isTerminal ? 'completed' : 'executed',
      }))

      if (isTerminal) {
        stopPolling(false)
        // Automatically re-run analysis in background so UI node count updates from 4 to 3!
        if (activeParamsRef.current) {
          const { clusterName, roleArn } = activeParamsRef.current
          void agentService.analyze({ cluster_name: clusterName, role_arn: roleArn })
            .then((freshAnalysis) => {
              setState(prev => ({ ...prev, analysisResult: freshAnalysis }))
            })
            .catch(() => { /* silent fallback */ })
        }
      }

    } catch (err) {
      console.warn('[AgentFlow] Polling error:', err)
      // On network glitch, don't stop immediately; retry next cycle
    }
  }, [stopPolling])

  const startPolling = useCallback((opId: string) => {
    notFoundCountRef.current = 0
    setState(prev => ({ ...prev, isPolling: true, pollingStopped: false }))
    void poll(opId)
    intervalRef.current = setInterval(() => void poll(opId), POLL_INTERVAL_MS)
  }, [poll])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  // ── Agent 2: Execute ──────────────────────────────────────────────────────────
  const runExecute = useCallback(async (
    clusterName: string,
    roleArn:     string,
    targetNodeCount: number
  ) => {
    activeParamsRef.current = { clusterName, roleArn }
    setState(prev => ({
      ...prev,
      phase:          'executing',
      execResult:     null,
      operationId:    null,
      execStatus:     null,
      pollingStopped: false,
      error:          null,
    }))

    try {
      const result = await agentService.execute({
        cluster_name:      clusterName,
        role_arn:          roleArn,
        target_node_count: targetNodeCount,
        approval:          true,
        dry_run:           false,
      })

      const isTerminal = TERMINAL_STATUSES.includes(result.status)
      setState(prev => ({
        ...prev,
        phase:       isTerminal ? 'completed' : 'executed',
        execResult:  result,
        operationId: result.operation_id,
        execStatus:  result.status,
      }))

      // Start continuous polling every 5s
      if (result.operation_id) {
        startPolling(result.operation_id)
      }

      // If execution response returned COMPLETED immediately or with terminal state, refresh analysis
      if (isTerminal && activeParamsRef.current) {
        void agentService.analyze({ cluster_name: clusterName, role_arn: roleArn })
          .then((freshAnalysis) => {
            setState(prev => ({ ...prev, analysisResult: freshAnalysis }))
          })
          .catch(() => { /* silent */ })
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed'
      setState(prev => ({ ...prev, phase: 'error', error: message }))
    }
  }, [startPolling])

  const reset = useCallback(() => {
    stopPolling()
    setState(INITIAL_STATE)
  }, [stopPolling])

  return { ...state, runAnalysis, runExecute, reset }
}
