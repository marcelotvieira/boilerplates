import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { CancelInviteUseCase } from '../../../core/invites/use-cases/cancel-invite.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { cancelInviteParamsSchema } from '../../schemas/invite.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('CancelInviteHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type CancelInviteEvent = AuthenticatedEvent & ValidatedEvent

const cancelInviteHandler = async (
  event: CancelInviteEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/invites/{token}'

  try {
    const token = event.validatedPath?.token

    logger.info('Cancel invite request', {
      token,
      requestingUserId: event.user?.userId,
      tenantId: event.user?.tenantId
    })

    const useCase = container.get<CancelInviteUseCase>(TYPES.CancelInviteUseCase)
    const result = await useCase.execute({
      token,
      requestingUserTenantId: event.user!.tenantId,
      requestingUserRole: event.user!.role
    })

    logger.info('Invite cancelled successfully', {
      token,
      tenantId: event.user?.tenantId
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Cancel invite failed', error, {
      token: event.validatedPath?.token,
      requestingUserId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(cancelInviteHandler)
  .use(authMiddleware())
  .use(zodValidator({ pathParameters: cancelInviteParamsSchema }))
  .use(httpErrorHandler())
