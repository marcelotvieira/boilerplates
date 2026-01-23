import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { AcceptInviteUseCase } from '../../../core/invites/use-cases/accept-invite.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { acceptInviteSchema } from '../../schemas/invite.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('AcceptInviteHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const acceptInviteHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/invites/accept'

  try {
    logger.info('Accept invite request', {
      token: event.validatedBody?.token
    })

    const useCase = container.get<AcceptInviteUseCase>(TYPES.AcceptInviteUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Invite accepted successfully', {
      userId: result.userId,
      email: result.email,
      tenantId: result.tenantId
    })

    return createSuccessResponse(
      result,
      'Invite accepted successfully. You can now login with your credentials.',
      path,
      201
    )

  } catch (error: any) {
    logger.error('Accept invite failed', error, {
      token: event.validatedBody?.token
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(acceptInviteHandler)
  .use(zodValidator({ body: acceptInviteSchema }))
  .use(httpErrorHandler())
