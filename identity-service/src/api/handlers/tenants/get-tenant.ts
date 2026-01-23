import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { GetTenantUseCase } from '../../../core/tenants/use-cases/get-tenant.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('GetTenantHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const getTenantHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/tenants/me'

  try {
    logger.info('Get tenant request', {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })

    const useCase = container.get<GetTenantUseCase>(TYPES.GetTenantUseCase)
    const result = await useCase.execute({
      tenantId: event.user!.tenantId,
      requestingUserTenantId: event.user!.tenantId
    })

    logger.info('Tenant retrieved', {
      tenantId: result.id
    })

    return createSuccessResponse(
      result,
      'Tenant retrieved successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Get tenant failed', error, {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(getTenantHandler)
  .use(authMiddleware())
  .use(httpErrorHandler())
