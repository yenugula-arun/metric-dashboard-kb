/**
 * Types matching the backend contract for POST /api/v1/prometheus/status.
 *
 * What this endpoint tells us:
 *  - Whether Prometheus is installed in the given cluster at all
 *  - Whether the Prometheus deployment is healthy (running pods)
 *  - Whether a dedicated prometheus namespace exists
 *  - Whether a ClusterIP / NodePort service for Prometheus is present
 *  - Whether the Prometheus deployment resource itself exists
 *
 * All five boolean flags together give a complete health picture of the
 * Prometheus stack — useful for showing "onboarding checklist" UI.
 */

export interface PrometheusComponents {
  /** At least one Prometheus pod found in the cluster */
  installed: boolean
  /** All Prometheus pods are in Ready state */
  healthy: boolean
  /** A namespace dedicated to Prometheus exists */
  namespace: boolean
  /** A Kubernetes Service exposing Prometheus exists */
  service: boolean
  /** A Kubernetes Deployment for Prometheus exists */
  deployment: boolean
}

export interface PrometheusStatus {
  connected: boolean
  cluster: string
  prometheus: PrometheusComponents
}

/** Request body for POST /api/v1/prometheus/status */
export interface PrometheusStatusRequest {
  clusterName: string
  roleArn: string
}
