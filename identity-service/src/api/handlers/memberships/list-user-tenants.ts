import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { ListUserTenantsUseCase } from '../../../core/memberships/use-cases/list-user-tenants.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('ListUserTenantsHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const listUserTenantsHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/users/me/tenants'

  try {
    logger.info('List user tenants request', {
      userId: event.user?.userId
    })

    const useCase = container.get<ListUserTenantsUseCase>(TYPES.ListUserTenantsUseCase)
    const result = await useCase.execute({
      userId: event.user!.userId
    })

    logger.info('User tenants listed', {
      userId: event.user!.userId,
      count: result.tenants.length
    })

    return createSuccessResponse(
      result,
      'User tenants retrieved successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('List user tenants failed', error, {
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(listUserTenantsHandler)
  .use(authMiddleware())
  .use(httpErrorHandler())
