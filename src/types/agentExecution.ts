/**
 * Types for the AI Agent Cluster Optimizer flow.
 *
 * Agent 1 — POST /analyze  → AgentAnalysisResult   (AI analysis report)
 * Agent 2 — POST /execute  → AgentExecutionResult  (implementation/execution)
 * Agent 2 — GET  /executions/{id} → AgentExecutionResult (status polling)
 */

// ─── Agent 1: POST /analyze ────────────────────────────────────────────────────

export interface AgentAnalyzeRequest {
  cluster_name: string
  role_arn:     string
}

export interface AnalysisMetricsCurrent {
  cpu:    number
  memory: number
}

export interface AnalysisMetricsHistory {
  average_cpu:    number
  peak_cpu:       number
  minimum_cpu:    number
  average_memory: number
  peak_memory:    number
  minimum_memory: number
}

export interface AnalysisTopPodCpu {
  pod:            string
  cpu_millicores: number
}

export interface AnalysisTopPodMemory {
  pod:        string
  memory_mib: number
}

export interface AnalysisMetrics {
  current:         AnalysisMetricsCurrent
  history:         AnalysisMetricsHistory
  top_cpu_pods:    AnalysisTopPodCpu[]
  top_memory_pods: AnalysisTopPodMemory[]
}

export interface AnalysisInstanceGroup {
  instance_type: string
  region:        string
  count:         number
}

export interface AnalysisNode {
  name:          string
  instance_type: string
  region:        string
  zone:          string
  os:            string
  architecture:  string
}

export interface AnalysisCluster {
  node_count:      number
  instance_groups: AnalysisInstanceGroup[]
  nodes:           AnalysisNode[]
}

export interface SchedulingNodeResource {
  cpu_millicores: number
  memory_mib:     number
}

export interface SchedulingNode {
  name:                     string
  capacity:                 SchedulingNodeResource
  allocatable:              SchedulingNodeResource
  requested:                SchedulingNodeResource
  available:                SchedulingNodeResource
  available_cpu_percent:    number
  available_memory_percent: number
  pod_count:                number
  workload_pods:            number
  daemonset_pods:           number
}

export interface SchedulingSummary {
  total_allocatable_cpu:         number
  total_allocatable_memory:      number
  total_requested_cpu:           number
  total_requested_memory:        number
  total_available_cpu:           number
  total_available_memory:        number
  total_workload_pods:           number
  total_daemonset_pods:          number
  average_available_cpu_percent:    number
  average_available_memory_percent: number
}

export interface AnalysisScheduling {
  summary: SchedulingSummary
  nodes:   SchedulingNode[]
}

export interface OptimizationValidation {
  can_fit_cpu:              boolean
  can_fit_memory:           boolean
  cpu_headroom_percent:     number
  memory_headroom_percent:  number
  future_pods_per_node:     number
  optimization_safe:        boolean
  optimization_type:        string
  recommended_node_count:   number
  validation_reason:        string
}

export interface AnalysisPricing {
  instance_type:  string
  region:         string
  currency:       string
  price_per_hour: number
}

export interface AnalysisCost {
  currency:       string
  instance_type:  string
  node_count:     number
  hourly_cost:    number
  daily_cost:     number
  monthly_cost:   number
}

export interface AnalysisContext {
  metrics:                AnalysisMetrics
  cluster:                AnalysisCluster
  scheduling:             AnalysisScheduling
  optimization_validation: OptimizationValidation
  pricing:                AnalysisPricing
  cost:                   AnalysisCost
}

export interface OptimizationResourceChange {
  type: string
  from: number
  to:   number
}

export interface OptimizationPlan {
  strategy:             string
  target_node_count:    number
  resource_changes:     OptimizationResourceChange[]
  target_instance_type: string
}

export interface AiAnalysis {
  summary:                       string
  reasoning:                     string[]
  recommendations:               string[]
  confidence_score:              number
  optimization_confidence:       string
  risk_level:                    string
  execution_priority:            string
  approval_required:             boolean
  optimization_safe:             boolean
  validation_reason:             string
  optimization_type:             string
  optimization_plan:             OptimizationPlan
  recommended_node_count:        number
  recommended_instance_type:     string
  optimized_monthly_cost:        number
  estimated_savings:             { monthly_usd: number }
  expected_cost_reduction_percent: number
}

/** Full response from POST /analyze */
export interface AgentAnalysisResult {
  analysis_context: AnalysisContext
  ai_analysis:      AiAnalysis
}

// ─── Agent 2: POST /execute & GET /executions/{id} ────────────────────────────

export type AgentExecutionStatus =
  | 'WAITING_FOR_TERMINATION'
  | 'WAITING_FOR_NODE_REMOVAL'
  | 'HEALTH_CHECK'
  | 'COMPLETED'
  | 'FAILED'

export interface AgentExecuteRequest {
  cluster_name:      string
  role_arn:          string
  target_node_count: number
  approval:          boolean
  dry_run:           boolean
}

export interface AgentSelectedNode {
  name:              string
  score:             number
  workload_pods:     number
  requested_cpu:     number
  requested_memory:  number
  has_statefulset:   boolean
  has_local_storage: boolean
  has_pdb:           boolean
}

export interface AgentSimulation {
  safe:             boolean
  cpu_needed:       number
  cpu_available:    number
  memory_needed:    number
  memory_available: number
  pods_needed:      number
  pods_available:   number
  checks: {
    cpu:    boolean
    memory: boolean
    pods:   boolean
  }
  reason: string
}

export interface AgentValidation {
  safe: boolean
  checks: {
    node_ready:            boolean
    capacity:              boolean
    pod_disruption_budget: boolean
    statefulsets:          boolean
    local_storage:         boolean
  }
  reason: string
}

export interface AgentDrain {
  evicted: string[]
  skipped: string[]
}

export interface AgentLog {
  timestamp: string
  step:      string
  status:    'STARTED' | 'SUCCESS' | 'FAILED' | string
  message:   string
}

export interface AgentExecutionResult {
  operation_id:         string
  status:               AgentExecutionStatus
  selected_node?:       AgentSelectedNode
  terminated_instance?: string
  simulation?:          AgentSimulation
  validation?:          AgentValidation
  drain?:               AgentDrain
  logs?:                AgentLog[]
  message?:             string
}
