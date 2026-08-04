import { Menu, ShieldCheck, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAWSContext } from '@/context/AWSContext'
import type { ClusterHealthStatus } from '@/types'

interface TopbarProps {
  title:            string
  sidebarCollapsed: boolean
  onMenuToggle:     () => void
  clusterHealth?:   ClusterHealthStatus
  clusterName?:     string
}

const healthDot: Record<ClusterHealthStatus, string> = {
  healthy:  'bg-emerald-500',
  degraded: 'bg-amber-500',
  critical: 'bg-red-500 animate-pulse',
  unknown:  'bg-slate-400',
}

const healthLabel: Record<ClusterHealthStatus, string> = {
  healthy:  'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  unknown:  'Unknown',
}

export function Topbar({
  title,
  sidebarCollapsed,
  onMenuToggle,
  clusterHealth = 'unknown',
  clusterName,
}: TopbarProps) {
  const { connection, roleArn, disconnect } = useAWSContext()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-14 flex items-center gap-4 px-4',
        'bg-white border-b border-slate-200',
        'transition-[left] duration-200 ease-in-out',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Menu button */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="
          flex items-center justify-center w-8 h-8 shrink-0
          text-slate-600 hover:text-slate-900 hover:bg-slate-100
          transition-colors duration-100 cursor-pointer
        "
      >
        <Menu size={16} />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-slate-900 shrink-0">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* AWS Account Connection Badge & Disconnect */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-slate-50 text-xs">
        <ShieldCheck size={14} className={connection ? 'text-emerald-600' : 'text-amber-500'} />
        <span className="text-slate-600 font-medium">
          {connection ? `Account ${connection.accountId}` : 'AWS Not Connected'}
        </span>
        <button
          onClick={disconnect}
          title={`Disconnect ${roleArn} and return to Landing Page`}
          className="ml-1 text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          <LogOut size={12} />
          <span>Switch</span>
        </button>
      </div>

      {/* Cluster Health Indicator — Only shown when a specific cluster is active */}
      {Boolean(clusterName) && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-slate-50">
          <span className={cn('w-2 h-2 shrink-0', healthDot[clusterHealth])} />
          <span className="text-xs text-slate-600">
            {clusterName}:&nbsp;
            <span className="text-slate-900 font-medium">{healthLabel[clusterHealth]}</span>
          </span>
        </div>
      )}
    </header>
  )
}
