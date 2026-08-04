import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/** Inline skeleton line */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton bg-slate-200',
        className
      )}
    />
  )
}

/** Full metric card skeleton */
export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-2 w-16" />
    </div>
  )
}

/** Chart area skeleton */
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="animate-skeleton bg-slate-100" style={{ height }} />
    </div>
  )
}

/** Table row skeleton */
export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-200">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3 w-full" />
        </td>
      ))}
    </tr>
  )
}
