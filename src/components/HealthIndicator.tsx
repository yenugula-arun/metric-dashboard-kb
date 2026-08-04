import { cn } from '@/utils/cn'
import type { ClusterHealthStatus } from '@/types'

interface HealthIndicatorProps {
  status:    ClusterHealthStatus
  showLabel?: boolean
  size?:     'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig: Record<ClusterHealthStatus, {
  dot:   string
  label: string
  ring:  string
}> = {
  healthy:  { dot: 'bg-[#22c55e]', label: 'Healthy',  ring: 'ring-[#22c55e]/20' },
  degraded: { dot: 'bg-[#f59e0b]', label: 'Degraded', ring: 'ring-[#f59e0b]/20' },
  critical: { dot: 'bg-[#ef4444]', label: 'Critical', ring: 'ring-[#ef4444]/20' },
  unknown:  { dot: 'bg-[#4a5568]', label: 'Unknown',  ring: 'ring-[#4a5568]/20' },
}

const sizeConfig = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

export function HealthIndicator({
  status,
  showLabel = true,
  size = 'md',
  className,
}: HealthIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          sizeConfig[size],
          'shrink-0 ring-2',
          config.dot,
          config.ring,
          status === 'critical' ? 'animate-pulse' : ''
        )}
      />
      {showLabel && (
        <span className="text-xs text-[#8b95a8]">{config.label}</span>
      )}
    </div>
  )
}
