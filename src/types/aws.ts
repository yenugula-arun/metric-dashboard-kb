/**
 * Types matching the backend contract for GET /api/v1/aws/connect.
 * Do NOT add metric fields here — this endpoint is cluster discovery only.
 */

export type EKSClusterStatus =
  | 'ACTIVE'
  | 'CREATING'
  | 'DELETING'
  | 'FAILED'
  | 'UPDATING'
  | 'PENDING'

export interface EKSCluster {
  name:    string
  arn:     string
  region:  string
  status:  EKSClusterStatus
  version: string
}

export interface AWSConnection {
  connectionId: string
  accountId:    string
  clusters:     EKSCluster[]
}
