import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { ListTenantInvitesUseCase } from '../../../core/invites/use-cases/list-tenant-invites.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('ListInvitesHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const listInvitesHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/invites'

  try {
    logger.info('List invites request', {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })

    const useCase = container.get<ListTenantInvitesUseCase>(TYPES.ListTenantInvitesUseCase)
    const result = await useCase.execute({
      tenantId: event.user!.tenantId,
      requestingUserTenantId: event.user!.tenantId
    })

    logger.info('Invites retrieved', {
      tenantId: event.user?.tenantId,
      count: result.total
    })

    return createSuccessResponse(
      result,
      'Invites retrieved successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('List invites failed', error, {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(listInvitesHandler)
  .use(authMiddleware())
  .use(httpErrorHandler())
