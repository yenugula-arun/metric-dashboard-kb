import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import { DashboardLayout }      from '@/layouts/DashboardLayout'
import ConnectLandingPage       from '@/pages/ConnectLanding'
import DashboardPage            from '@/pages/Dashboard'
import ClustersPage             from '@/pages/Clusters'
import ClusterDetailsPage       from '@/pages/ClusterDetails'
import DeploymentsPage          from '@/pages/Deployments'
import ResourceMetricsPage      from '@/pages/ResourceMetrics'
import AIRecommendationsPage    from '@/pages/AIRecommendations'
import { ROUTES }               from '@/constants/routes'

const router = createBrowserRouter([
  {
    path:    ROUTES.ROOT,
    element: <ConnectLandingPage />,
  },
  {
    path:     '/',
    element:  <DashboardLayout />,
    children: [
      { path: ROUTES.DASHBOARD,        element: <DashboardPage />,         },
      { path: ROUTES.CLUSTERS,         element: <ClustersPage />,          },
      { path: ROUTES.CLUSTER_DETAILS,  element: <ClusterDetailsPage />,    },
      { path: ROUTES.DEPLOYMENTS,      element: <DeploymentsPage />,       },
      { path: ROUTES.METRICS,          element: <ResourceMetricsPage />,   },
      { path: ROUTES.RECOMMENDATIONS,  element: <AIRecommendationsPage />, },
    ],
  },
  {
    path:    '*',
    element: <Navigate to={ROUTES.ROOT} replace />,
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}

