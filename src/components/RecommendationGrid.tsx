import { memo } from 'react'
import { RecommendationCard }  from './RecommendationCard'
import { MetricCardSkeleton }  from '@/components/LoadingSkeleton'
import { EmptyState }          from '@/components/EmptyState'
import { ErrorState }          from '@/components/ErrorState'
import { Sparkles }            from 'lucide-react'
import type { AIRecommendation, DeploymentRow } from '@/types'

interface RecommendationGridProps {
  recommendations: AIRecommendation[] | null
  deployments:     DeploymentRow[]    | null
  loading:         boolean
  error:           string | null
  onRefresh:       () => void
  onApprove:       (id: string) => void
  onReject:        (id: string) => void
}

/**
 * RecommendationGrid — renders the recommendation card grid.
 * Cross-references deployments to enrich cards with live CPU/memory metrics.
 * All data is passed in as props — no service calls here.
 */
export const RecommendationGrid = memo(function RecommendationGrid({
  recommendations,
  deployments,
  loading,
  error,
  onRefresh,
  onApprove,
  onReject,
}: RecommendationGridProps) {
  if (error) {
    return <ErrorState description={error} onRetry={onRefresh} />
  }

  if (loading || !recommendations) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 space-y-3">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  const pending = recommendations.filter((r) => r.status === 'pending')

  if (pending.length === 0 && recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={36} strokeWidth={1} className="text-slate-400" />}
        title="No recommendations"
        description="The AI engine has not generated any optimization suggestions yet."
      />
    )
  }

  // Cross-reference deployments to get live resource data per service
  const deploymentMap = new Map<string, DeploymentRow>(
    (deployments ?? []).map((d) => [d.name, d])
  )

  // Show pending first, then others
  const sorted = [...recommendations].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2, executing: 3, done: 4 }
    return (order[a.status] ?? 5) - (order[b.status] ?? 5)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {sorted.map((rec) => {
        const dep = deploymentMap.get(rec.serviceName)
        return (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            cpuUsage={dep?.cpuUsage}
            memoryUsage={dep?.memoryUsage}
            cpuPercent={dep?.cpuPercent}
            memoryPercent={dep?.memoryPercent}
            requestsPerSec={dep?.requestsPerSec}
            onApprove={onApprove}
            onReject={onReject}
          />
        )
      })}
    </div>
  )
})
