import {
  LayoutDashboard,
  Server,
  Layers,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from './routes'
import type { LucideIcon } from 'lucide-react'

export interface SidebarItem {
  label:   string
  path:    string
  icon:    LucideIcon
  badge?:  number
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard',          path: ROUTES.DASHBOARD,       icon: LayoutDashboard },
  { label: 'Clusters',           path: ROUTES.CLUSTERS,        icon: Server           },
  { label: 'Deployments',        path: ROUTES.DEPLOYMENTS,     icon: Layers           },
  { label: 'Resource Metrics',   path: ROUTES.METRICS,         icon: BarChart3        },
  { label: 'AI Recommendations', path: ROUTES.RECOMMENDATIONS, icon: Sparkles         },
]
