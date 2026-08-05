import { useState, useRef, useEffect } from 'react'
import {
  Brain,
  CheckCircle2,
  XCircle,
  Server,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Play,
  TrendingDown,
  DollarSign,
  BarChart3,
  ListChecks,
  Lightbulb,
  ChevronRight,
  Terminal,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAgentFlow } from '@/hooks/useAgentExecution'
import type { AgentLog } from '@/types'

// ─── Small UI helpers ────────────────────────────────────────────────────────

function Badge({ children, variant = 'default' }: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'indigo' | 'blue'
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
      variant === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
      variant === 'warning' && 'bg-amber-50 border-amber-200 text-amber-700',
      variant === 'danger'  && 'bg-red-50 border-red-200 text-red-700',
      variant === 'indigo'  && 'bg-indigo-50 border-indigo-200 text-indigo-700',
      variant === 'blue'    && 'bg-blue-50 border-blue-200 text-blue-600',
      variant === 'default' && 'bg-slate-100 border-slate-200 text-slate-600',
    )}>
      {children}
    </span>
  )
}

function CheckBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
      ok
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50 border-red-200 text-red-700'
    )}>
      {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </span>
  )
}

function MetricCard({ label, value, sub, accent }: {
  label:   string
  value:   string | number
  sub?:    string
  accent?: 'blue' | 'green' | 'amber' | 'red'
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 space-y-0.5">
      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={cn(
        'text-lg font-bold',
        accent === 'blue'  ? 'text-blue-700'    :
        accent === 'green' ? 'text-emerald-700' :
        accent === 'amber' ? 'text-amber-700'   :
        accent === 'red'   ? 'text-red-700'     :
        'text-slate-900'
      )}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, right }: {
  icon:   React.ElementType
  title:  string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-slate-400" />
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  )
}

function LogLine({ log }: { log: AgentLog }) {
  const color =
    log.status === 'SUCCESS' ? 'text-emerald-400' :
    log.status === 'FAILED'  ? 'text-red-400'     :
    log.status === 'STARTED' ? 'text-blue-400'    :
    'text-slate-400'

  const time = (() => {
    try {
      return new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
    } catch {
      return log.timestamp.slice(11, 19)
    }
  })()

  return (
    <div className="flex items-start gap-2 font-mono text-[11px] leading-5 py-0.5 border-b border-slate-800/40 last:border-0">
      <span className="text-slate-500 shrink-0 w-16">{time}</span>
      <span className={cn('shrink-0 font-bold w-32 truncate uppercase', color)}>{log.step}</span>
      <span className="text-slate-400 shrink-0 w-16">{log.status}</span>
      <span className="text-slate-300 flex-1 leading-relaxed">{log.message}</span>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface AgentExecutionPanelProps {
  clusterName: string
  roleArn:     string
}

export function AgentExecutionPanel({ clusterName, roleArn }: AgentExecutionPanelProps) {
  const {
    phase,
    analysisResult,
    execResult,
    isPolling,
    error,
    runAnalysis,
    runExecute,
    reset,
  } = useAgentFlow()

  const [targetNodeCount, setTargetNodeCount] = useState<number>(
    analysisResult?.ai_analysis?.recommended_node_count ?? 3
  )

  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [execResult?.logs?.length])

  const handleProceedExecute = async () => {
    await runExecute(clusterName, roleArn, targetNodeCount)
  }

  const ai   = analysisResult?.ai_analysis
  const ctx  = analysisResult?.analysis_context
  const cost = ctx?.cost

  // ── Idle ──────────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="relative overflow-hidden rounded-xl border border-indigo-200/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Brain size={18} className="text-indigo-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Cluster Analysis</h2>
                <p className="text-[10px] text-indigo-400/70 mt-0.5">
                  Powered by KubeAI agent · <span className="font-mono">{clusterName || '—'}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Analyses live cluster metrics, scheduling capacity, and cost data.
              Produces an AI-powered recommendation with confidence score,
              savings estimate, and a safe optimization plan.
            </p>
          </div>

          <button
            id="btn-ai-analyse"
            onClick={() => void runAnalysis(clusterName, roleArn)}
            disabled={!clusterName || !roleArn}
            className={cn(
              'group flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold shrink-0',
              'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40',
              'shadow-xl shadow-indigo-900/50 transition-all duration-200',
              'hover:scale-105 active:scale-100 hover:shadow-indigo-500/40',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer',
            )}
          >
            <Brain size={15} className="group-hover:animate-pulse" />
            Run AI Analysis
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  // ── Analysing (POST /analyze in-flight) ──────────────────────────────────────
  if (phase === 'analysing') {
    return (
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
            <Loader2 size={20} className="text-indigo-600 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">AI agent is analysing your cluster…</p>
            <p className="text-xs text-indigo-500 mt-0.5">
              Collecting metrics, scheduling data, and pricing information from{' '}
              <span className="font-mono font-semibold">{clusterName}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {[
            'Collecting CPU & memory metrics',
            'Evaluating node scheduling capacity',
            'Running scheduling simulation',
            'Generating AI cost analysis',
          ].map(s => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={11} className="animate-spin text-indigo-400 shrink-0" />
              {s}…
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-800">Agent Request Failed</p>
            <p className="text-xs text-red-600 mt-1">{error ?? 'Unable to reach the AI agent.'}</p>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0">
            <RefreshCw size={11} /> Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Executing (POST /execute in-flight) ──────────────────────────────────────
  if (phase === 'executing') {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-slate-50 p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <Loader2 size={20} className="text-amber-600 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Executing optimization…</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Submitting node removal to <span className="font-mono font-semibold">{clusterName}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {[
            'Cordoning selected node',
            'Draining workload pods',
            'Submitting EC2 termination',
            'Waiting for confirmation',
          ].map(s => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={11} className="animate-spin text-amber-400 shrink-0" />
              {s}…
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Analysis Result & Execution Results Display ──────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className={cn(
        'px-5 py-4 flex items-center justify-between gap-4',
        phase === 'completed'
          ? 'bg-gradient-to-r from-emerald-900 to-slate-900'
          : phase === 'executed'
          ? 'bg-gradient-to-r from-amber-900 to-slate-900'
          : 'bg-gradient-to-r from-indigo-950 to-slate-900'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          {phase === 'completed'
            ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            : <Brain size={18} className="text-indigo-300 shrink-0" />
          }
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">
              {phase === 'completed' ? 'Optimization Complete' :
               phase === 'executed'  ? 'Optimization Executing / Polling' :
               'AI Analysis Report'}
            </p>
            {ai && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Confidence:{' '}
                <span className={cn(
                  'font-bold',
                  ai.optimization_confidence === 'HIGH' ? 'text-emerald-400' :
                  ai.optimization_confidence === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                )}>
                  {ai.confidence_score}% {ai.optimization_confidence}
                </span>
                {' · '}Risk: <span className={cn(
                  'font-bold',
                  ai.risk_level === 'LOW' ? 'text-emerald-400' :
                  ai.risk_level === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                )}>{ai.risk_level}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPolling && (
            <span className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
              <Loader2 size={10} className="animate-spin" /> Polling (5s)
            </span>
          )}
          <button onClick={reset} className="text-xs text-slate-500 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6 bg-white">

        {/* ─── EXECUTION DETAILS (Rendered when execResult exists) ─────────── */}
        {execResult && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                  <Play size={16} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Execution & Polling Details</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Op ID: {execResult.operation_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={
                  execResult.status === 'COMPLETED' ? 'success' :
                  execResult.status === 'FAILED' ? 'danger' : 'warning'
                }>
                  STATUS: {execResult.status.replace(/_/g, ' ')}
                </Badge>
                {isPolling && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                    <Loader2 size={10} className="animate-spin" /> polling endpoint every 5s
                  </span>
                )}
              </div>
            </div>

            {execResult.message && (
              <p className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3.5 py-2 font-mono">
                ℹ {execResult.message}
              </p>
            )}

            {/* Selected Node & EC2 Instance */}
            {execResult.selected_node && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server size={13} className="text-indigo-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Node for Removal</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Node Name</p>
                    <p className="text-xs font-mono font-bold text-amber-300 break-all">{execResult.selected_node.name}</p>
                    {execResult.terminated_instance && (
                      <p className="text-[10px] font-mono text-emerald-400 mt-0.5">EC2 Instance: {execResult.terminated_instance}</p>
                    )}
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Score / Pods</p>
                    <p className="text-xs font-mono font-bold text-white">{execResult.selected_node.score} / {execResult.selected_node.workload_pods} pods</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Requested CPU/Mem</p>
                    <p className="text-xs font-mono font-bold text-white">{execResult.selected_node.requested_cpu}m / {execResult.selected_node.requested_memory}MiB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Simulation & Validation */}
            {(execResult.simulation || execResult.validation) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {execResult.simulation && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-indigo-400 uppercase">Scheduling Simulation</p>
                      <Badge variant={execResult.simulation.safe ? 'success' : 'danger'}>
                        {execResult.simulation.safe ? 'SAFE' : 'UNSAFE'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{execResult.simulation.reason}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <CheckBadge ok={execResult.simulation.checks.cpu} label="CPU" />
                      <CheckBadge ok={execResult.simulation.checks.memory} label="Memory" />
                      <CheckBadge ok={execResult.simulation.checks.pods} label="Pods" />
                    </div>
                  </div>
                )}

                {execResult.validation && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-emerald-400 uppercase">Drain Validation</p>
                      <Badge variant={execResult.validation.safe ? 'success' : 'danger'}>
                        {execResult.validation.safe ? 'SAFE TO DRAIN' : 'UNSAFE'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{execResult.validation.reason}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <CheckBadge ok={execResult.validation.checks.node_ready} label="Ready" />
                      <CheckBadge ok={execResult.validation.checks.capacity} label="Capacity" />
                      <CheckBadge ok={execResult.validation.checks.pod_disruption_budget} label="PDB" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pod Drain Evicted / Skipped Lists */}
            {execResult.drain && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pod Drain Results</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">
                      Evicted Pods ({execResult.drain.evicted.length})
                    </p>
                    {execResult.drain.evicted.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">None</p>
                    ) : (
                      execResult.drain.evicted.map((p) => (
                        <p key={p} className="text-[11px] font-mono text-emerald-300 truncate py-0.5">✓ {p}</p>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">
                      Skipped Pods ({execResult.drain.skipped.length})
                    </p>
                    {execResult.drain.skipped.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">None</p>
                    ) : (
                      execResult.drain.skipped.map((p) => (
                        <p key={p} className="text-[11px] font-mono text-slate-400 truncate py-0.5">• {p}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Execution Logs Terminal */}
            {execResult.logs && execResult.logs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-amber-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Agent Execution Logs</p>
                  <span className="text-[10px] font-mono text-slate-500 ml-auto">{execResult.logs.length} events</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {execResult.logs.map((l, i) => (
                    <LogLine key={i} log={l} />
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── 1. AI Summary ─────────────────────────────────────────────────── */}
        {ai && (
          <section>
            <SectionTitle icon={Brain} title="AI Summary" right={
              <div className="flex items-center gap-1.5">
                <Badge variant={ai.optimization_confidence === 'HIGH' ? 'success' : 'warning'}>
                  {ai.optimization_confidence}
                </Badge>
                <Badge variant={ai.risk_level === 'LOW' ? 'success' : ai.risk_level === 'MEDIUM' ? 'warning' : 'danger'}>
                  {ai.risk_level} RISK
                </Badge>
                <Badge variant={ai.optimization_safe ? 'success' : 'danger'}>
                  {ai.optimization_safe ? '✓ SAFE' : '✗ NOT SAFE'}
                </Badge>
              </div>
            } />
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-sm text-indigo-900 leading-relaxed font-medium">{ai.summary}</p>
            </div>
          </section>
        )}

        {/* ─── 2. Cost Impact ────────────────────────────────────────────────── */}
        {ai && cost && (
          <section>
            <SectionTitle icon={DollarSign} title="Cost Impact" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricCard
                label="Current Monthly"
                value={`$${cost.monthly_cost.toFixed(2)}`}
                sub={`${cost.node_count} × ${cost.instance_type}`}
                accent="red"
              />
              <MetricCard
                label="Optimized Monthly"
                value={`$${ai.optimized_monthly_cost.toFixed(2)}`}
                sub={`${ai.recommended_node_count} × ${ai.recommended_instance_type}`}
                accent="green"
              />
              <MetricCard
                label="Monthly Savings"
                value={`$${ai.estimated_savings.monthly_usd.toFixed(2)}`}
                sub="per month"
                accent="green"
              />
              <MetricCard
                label="Cost Reduction"
                value={`${ai.expected_cost_reduction_percent.toFixed(0)}%`}
                sub="reduction"
                accent="blue"
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2.5">
              <MetricCard label="Hourly" value={`$${cost.hourly_cost}`}  />
              <MetricCard label="Daily"  value={`$${cost.daily_cost}`}   />
              <MetricCard label="Current Nodes" value={`${cost.node_count} × ${cost.instance_type}`} />
            </div>
          </section>
        )}

        {/* ─── 3. Cluster Metrics ────────────────────────────────────────────── */}
        {ctx?.metrics && (
          <section>
            <SectionTitle icon={BarChart3} title="Live Cluster Metrics" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricCard label="CPU Utilization"  value={`${ctx.metrics.current.cpu}%`}    accent="amber" />
              <MetricCard label="Memory Utilization" value={`${ctx.metrics.current.memory}%`} accent="blue" />
              <MetricCard label="Avg CPU (7d)"    value={`${ctx.metrics.history.average_cpu}%`}    />
              <MetricCard label="Peak CPU (7d)"   value={`${ctx.metrics.history.peak_cpu}%`}       />
            </div>

            {/* Top pods table */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Top CPU pods */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Top CPU Pods
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  {ctx.metrics.top_cpu_pods.slice(0, 5).map((p, i) => (
                    <div key={p.pod} className={cn(
                      'flex items-center gap-2 px-3 py-2 text-[11px]',
                      i < ctx.metrics.top_cpu_pods.length - 1 && 'border-b border-slate-100'
                    )}>
                      <span className="text-slate-400 w-4 shrink-0">{i + 1}</span>
                      <span className="font-mono text-slate-700 flex-1 truncate">{p.pod}</span>
                      <span className="font-bold text-amber-600 shrink-0">{p.cpu_millicores}m</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Top Memory pods */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Top Memory Pods
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  {ctx.metrics.top_memory_pods.slice(0, 5).map((p, i) => (
                    <div key={p.pod} className={cn(
                      'flex items-center gap-2 px-3 py-2 text-[11px]',
                      i < ctx.metrics.top_memory_pods.length - 1 && 'border-b border-slate-100'
                    )}>
                      <span className="text-slate-400 w-4 shrink-0">{i + 1}</span>
                      <span className="font-mono text-slate-700 flex-1 truncate">{p.pod}</span>
                      <span className="font-bold text-blue-600 shrink-0">{p.memory_mib} MiB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 4. Scheduling & Validation ────────────────────────────────────── */}
        {ctx?.scheduling && ctx?.optimization_validation && (
          <section>
            <SectionTitle icon={Server} title="Scheduling & Optimization Validation" right={
              <Badge variant={ctx.optimization_validation.optimization_safe ? 'success' : 'danger'}>
                {ctx.optimization_validation.optimization_safe ? '✓ SAFE TO OPTIMIZE' : '✗ NOT SAFE'}
              </Badge>
            } />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              <MetricCard
                label="Available CPU"
                value={`${ctx.scheduling.summary.average_available_cpu_percent.toFixed(1)}%`}
                sub={`${ctx.scheduling.summary.total_available_cpu}m free`}
                accent="green"
              />
              <MetricCard
                label="Available Memory"
                value={`${ctx.scheduling.summary.average_available_memory_percent.toFixed(1)}%`}
                sub={`${ctx.scheduling.summary.total_available_memory} MiB free`}
                accent="blue"
              />
              <MetricCard
                label="CPU Headroom (post)"
                value={`${ctx.optimization_validation.cpu_headroom_percent.toFixed(1)}%`}
                sub="after optimization"
                accent={ctx.optimization_validation.cpu_headroom_percent > 15 ? 'green' : 'amber'}
              />
              <MetricCard
                label="Mem Headroom (post)"
                value={`${ctx.optimization_validation.memory_headroom_percent.toFixed(1)}%`}
                sub="after optimization"
                accent={ctx.optimization_validation.memory_headroom_percent > 10 ? 'green' : 'amber'}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <CheckBadge ok={ctx.optimization_validation.can_fit_cpu}    label="CPU Fits" />
              <CheckBadge ok={ctx.optimization_validation.can_fit_memory}  label="Memory Fits" />
              <CheckBadge ok={ctx.optimization_validation.optimization_safe} label="Optimization Safe" />
            </div>

            {ctx.optimization_validation.validation_reason && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <p className="text-xs text-slate-600">{ctx.optimization_validation.validation_reason}</p>
              </div>
            )}

            {/* Per-node scheduling breakdown */}
            {ctx.scheduling.nodes.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Node Scheduling Breakdown</p>
                <div className="space-y-2">
                  {ctx.scheduling.nodes.map(node => (
                    <div key={node.name} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-700 flex-1 min-w-0 truncate">{node.name}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-amber-600 font-semibold">
                          CPU <span className="font-bold">{node.available_cpu_percent.toFixed(0)}%</span> free
                        </span>
                        <span className="text-blue-600 font-semibold">
                          Mem <span className="font-bold">{node.available_memory_percent.toFixed(0)}%</span> free
                        </span>
                        <span className="text-slate-500">
                          {node.workload_pods}W / {node.daemonset_pods}D pods
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── 5. AI Reasoning ───────────────────────────────────────────────── */}
        {ai?.reasoning && ai.reasoning.length > 0 && (
          <section>
            <SectionTitle icon={Lightbulb} title="AI Reasoning" />
            <ul className="space-y-1.5">
              {ai.reasoning.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <ChevronRight size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ─── 6. Recommendations ────────────────────────────────────────────── */}
        {ai?.recommendations && ai.recommendations.length > 0 && (
          <section>
            <SectionTitle icon={ListChecks} title="Recommendations" />
            <ul className="space-y-2">
              {ai.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-800">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ─── 7. Optimization Plan ──────────────────────────────────────────── */}
        {ai?.optimization_plan && (
          <section>
            <SectionTitle icon={TrendingDown} title="Optimization Plan" />
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-700">{ai.optimization_plan.strategy}</p>
              <div className="flex flex-wrap gap-3">
                {ai.optimization_plan.resource_changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{c.type.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold text-red-500">{c.from}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-sm font-bold text-emerald-600">{c.to}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">INSTANCE TYPE</span>
                  <span className="text-sm font-bold text-slate-600 font-mono">
                    {ai.optimization_plan.target_instance_type}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── CTA: Proceed to Implement ─────────────────────────────────────── */}
        {phase === 'analysed' && ai?.optimization_safe && !execResult && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-bold text-indigo-900">Ready to optimize?</p>
              <p className="text-xs text-slate-500">
                The AI recommends reducing to{' '}
                <span className="font-bold text-indigo-700">{ai.recommended_node_count} nodes</span>{' '}
                ({ai.recommended_instance_type}).
                Estimated savings:{' '}
                <span className="font-bold text-emerald-600">${ai.estimated_savings.monthly_usd.toFixed(2)}/month</span>.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <label htmlFor="target-node-count-input" className="text-[11px] text-slate-500 font-medium">
                  Target node count:
                </label>
                <input
                  id="target-node-count-input"
                  type="number"
                  min={1}
                  max={50}
                  value={targetNodeCount}
                  onChange={(e) => setTargetNodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-1.5 py-0.5 text-xs font-mono bg-white border border-indigo-200 text-indigo-700 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              id="btn-proceed-implement"
              onClick={() => void handleProceedExecute()}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0',
                'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500',
                'shadow-lg shadow-indigo-900/30 transition-all duration-200',
                'hover:scale-105 active:scale-100 cursor-pointer',
              )}
            >
              <Play size={13} />
              Proceed to Implement
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Re-run analysis button */}
        {(phase === 'analysed' || phase === 'executed' || phase === 'completed') && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Want fresh data?</span>
            <button
              onClick={() => void runAnalysis(clusterName, roleArn)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              <RefreshCw size={11} /> Re-run Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
