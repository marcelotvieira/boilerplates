import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { DeleteUserUseCase } from '../../../core/users/use-cases/delete-user.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { deleteUserParamsSchema } from '../../schemas/user.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('DeleteUserHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type DeleteUserEvent = AuthenticatedEvent & ValidatedEvent

const deleteUserHandler = async (
  event: DeleteUserEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/users/{userId}'

  try {
    const targetUserId = event.validatedPath?.userId

    logger.info('Delete user request', {
      targetUserId,
      requestingUserId: event.user?.userId
    })

    const useCase = container.get<DeleteUserUseCase>(TYPES.DeleteUserUseCase)
    const result = await useCase.execute({
      userId: targetUserId,
      requestingUserId: event.user!.userId,
      requestingUserRole: event.user!.role
    })

    logger.info('User deleted successfully', {
      targetUserId,
      requestingUserId: event.user?.userId
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Delete user failed', error, {
      targetUserId: event.validatedPath?.userId,
      requestingUserId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(deleteUserHandler)
  .use(authMiddleware())
  .use(zodValidator({ pathParameters: deleteUserParamsSchema }))
  .use(httpErrorHandler())
