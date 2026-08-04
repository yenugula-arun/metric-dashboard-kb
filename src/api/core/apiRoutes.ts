/**
 * Centralized API endpoint URLs.
 * Never hardcode paths in service files — import from here.
 * When the backend API changes, only update this file.
 */
export const API_ROUTES = {
  AWS: {
    CONNECT: '/aws/connect',
  },

  CLUSTER: {
    SUMMARY:    '/cluster/summary',
    HEALTH:     '/cluster/health',
    METRICS:    '/cluster/metrics',
    CONNECT:    '/clusters/connect',
    NAMESPACES: '/clusters/namespaces',
    SERVICES:   '/clusters/services',
    PODS:       '/clusters/pods',
    NODES:      '/clusters/nodes',
    DEPLOYMENTS: '/clusters/deployments',
  },

  PROMETHEUS: {
    STATUS:  '/prometheus/status',
    INSTALL: '/prometheus/install',
  },

  METRICS: {
    OVERVIEW:     '/metrics/overview',
    CPU:          '/metrics/cpu',
    MEMORY:       '/metrics/memory',
    PODS_CPU:     '/metrics/pods/cpu',
    PODS_MEMORY:  '/metrics/pods/memory',
    NODES_CPU:    '/metrics/nodes/cpu',
    NODES_MEMORY: '/metrics/nodes/memory',
  },

  DEPLOYMENTS: {
    GET_ALL: '/deployments',
    DETAILS: (name: string) => `/deployments/${name}`,
  },

  RECOMMENDATIONS: {
    GET_ALL:  '/recommendations',
    APPROVE:  (id: string) => `/recommendations/${id}/approve`,
    REJECT:   (id: string) => `/recommendations/${id}/reject`,
  },

  ACTIVITY: {
    GET_ALL: '/activity',
  },
} as const
