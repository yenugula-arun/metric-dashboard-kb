import { memo } from 'react'
import { TimelineItem }   from './TimelineItem'
import { EmptyState }     from '@/components/EmptyState'
import { ErrorState }     from '@/components/ErrorState'
import { Skeleton }       from '@/components/LoadingSkeleton'
import { ScrollText }     from 'lucide-react'
import type { ActivityEvent } from '@/types'

interface ActivityTimelineProps {
  events:   ActivityEvent[] | null
  loading:  boolean
  error:    string | null
  onRefresh: () => void
  /** Maximum number of events to display */
  limit?:   number
}

function TimelineSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 pb-4">
          {/* Icon placeholder */}
          <div className="flex flex-col items-center w-8 shrink-0">
            <Skeleton className="w-7 h-7" />
            {i < 3 && <Skeleton className="w-px flex-1 mt-1 min-h-[32px]" />}
          </div>
          {/* Content placeholder */}
          <div className="flex-1 space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-2.5 w-72" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * ActivityTimeline — renders the event feed.
 * Events are newest-first (sorted by timestamp descending).
 * Receives all data as props — no service calls.
 */
export const ActivityTimeline = memo(function ActivityTimeline({
  events,
  loading,
  error,
  onRefresh,
  limit = 7,
}: ActivityTimelineProps) {
  if (error) {
    return <ErrorState description={error} onRetry={onRefresh} />
  }

  if (loading || !events) {
    return <TimelineSkeleton />
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText size={36} strokeWidth={1} className="text-slate-400" />}
        title="No recent activity"
        description="Cluster events will appear here as they are detected."
      />
    )
  }

  // Sort newest-first, then take the limit
  const sorted = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)

  return (
    <div className="space-y-0">
      {sorted.map((event, index) => (
        <TimelineItem
          key={event.id}
          event={event}
          isLast={index === sorted.length - 1}
        />
      ))}
    </div>
  )
})
