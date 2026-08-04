import { BaseService } from '@/api/core/baseService'
import { API_ROUTES }  from '@/api/core/apiRoutes'
import type { APIResponse, AWSConnection } from '@/types'

/**
 * AWSService
 *
 * Handles POST /api/v1/aws/connect
 * Connects to user's AWS IAM Role ARN and returns real accountId and cluster list.
 */
class AWSService extends BaseService {
  async connect(roleArn: string): Promise<APIResponse<AWSConnection>> {
    return this.post<AWSConnection>(API_ROUTES.AWS.CONNECT, { roleArn })
  }
}

export const awsService = new AWSService()
