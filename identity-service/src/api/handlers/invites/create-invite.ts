import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { CreateInviteUseCase } from '../../../core/invites/use-cases/create-invite.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { createInviteSchema } from '../../schemas/invite.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('CreateInviteHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type CreateInviteEvent = AuthenticatedEvent & ValidatedEvent

const createInviteHandler = async (
  event: CreateInviteEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/invites'

  try {
    logger.info('Create invite request', {
      email: event.validatedBody?.email,
      role: event.validatedBody?.role,
      requestingUserId: event.user?.userId,
      tenantId: event.user?.tenantId
    })

    const useCase = container.get<CreateInviteUseCase>(TYPES.CreateInviteUseCase)
    const result = await useCase.execute({
      email: event.validatedBody!.email,
      role: event.validatedBody!.role,
      requestingUserId: event.user!.userId,
      requestingUserTenantId: event.user!.tenantId,
      requestingUserRole: event.user!.role
    })

    logger.info('Invite created successfully', {
      token: result.token,
      email: result.email,
      tenantId: event.user?.tenantId
    })

    return createSuccessResponse(
      result,
      'Invite created and sent successfully',
      path,
      201
    )

  } catch (error: any) {
    logger.error('Create invite failed', error, {
      email: event.validatedBody?.email,
      requestingUserId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(createInviteHandler)
  .use(authMiddleware())
  .use(zodValidator({ body: createInviteSchema }))
  .use(httpErrorHandler())
