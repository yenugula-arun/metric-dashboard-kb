import { useState } from 'react'
import { Outlet, Navigate }   from 'react-router-dom'
import { Sidebar }  from './Sidebar'
import { Topbar }   from './Topbar'
import { PageContainer } from './PageContainer'
import { useCluster }    from '@/hooks/useCluster'
import { useAWSContext } from '@/context/AWSContext'
import { ROUTES }        from '@/constants/routes'
import { Skeleton }       from '@/components/LoadingSkeleton'

/**
 * DashboardLayout — the root shell.
 * Gates access to dashboard content behind AWS Account connection.
 */
export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { data: cluster }         = useCluster()
  const { isConnected, loading }  = useAWSContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48 mx-auto text-slate-400" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return <Navigate to={ROUTES.ROOT} replace />
  }

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Right column */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar
          title="K8s Resource Optimizer"
          sidebarCollapsed={collapsed}
          onMenuToggle={() => setCollapsed((v) => !v)}
          clusterHealth={cluster?.healthStatus}
          clusterName={cluster?.clusterName}
        />

        {/* Content area — sits below fixed topbar */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto mt-14">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  )
}
