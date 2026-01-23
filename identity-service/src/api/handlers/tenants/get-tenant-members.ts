import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { GetTenantMembersUseCase } from '../../../core/tenants/use-cases/get-tenant-members.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('GetTenantMembersHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const getTenantMembersHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/tenants/me/members'

  try {
    logger.info('Get tenant members request', {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })

    const useCase = container.get<GetTenantMembersUseCase>(TYPES.GetTenantMembersUseCase)
    const result = await useCase.execute({
      tenantId: event.user!.tenantId,
      requestingUserTenantId: event.user!.tenantId
    })

    logger.info('Tenant members retrieved', {
      tenantId: event.user?.tenantId,
      count: result.total
    })

    return createSuccessResponse(
      result,
      'Tenant members retrieved successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Get tenant members failed', error, {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(getTenantMembersHandler)
  .use(authMiddleware())
  .use(httpErrorHandler())
