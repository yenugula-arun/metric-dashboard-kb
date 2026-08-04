/**
 * Application route path constants.
 * Import these wherever you need to navigate or define routes.
 */
export const ROUTES = {
  ROOT:            '/',
  DASHBOARD:       '/dashboard',
  CLUSTERS:        '/clusters',
  CLUSTER_DETAILS: '/clusters/:clusterName',
  DEPLOYMENTS:     '/deployments',
  METRICS:         '/metrics',
  RECOMMENDATIONS: '/recommendations',
  ACTIVITY_LOGS:   '/logs',
  SETTINGS:        '/settings',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]
