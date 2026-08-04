import { Sparkles, RefreshCw } from 'lucide-react'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useDeployments }     from '@/hooks/useDeployments'
import { useAWSContext }      from '@/context/AWSContext'
import { RecommendationGrid } from '@/components/RecommendationGrid'
import { Breadcrumb }         from '@/components/Breadcrumb'
import { ROUTES }             from '@/constants/routes'
import { cn }                 from '@/utils/cn'

export default function AIRecommendationsPage() {
  const { roleArn, connection } = useAWSContext()
  const activeClusterName = connection?.clusters?.[0]?.name ?? ''

  const { data: recs, loading: recsLoading, error: recsError, refresh: refreshRecs, approve, reject } = useRecommendations()
  const { data: depsData, loading: depsLoading } = useDeployments(activeClusterName, roleArn)

  const loading = recsLoading || depsLoading

  const breadcrumbs = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'AI Recommendations' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">AI Resource Recommendations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated vCPU &amp; Memory rightsizing suggestions powered by live Prometheus utilization data.
          </p>
        </div>

        <button
          onClick={refreshRecs}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      <RecommendationGrid
        recommendations={recs}
        deployments={depsData?.deployments ?? null}
        loading={loading}
        error={recsError}
        onRefresh={refreshRecs}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  )
}
