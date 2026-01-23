import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { GetUserProfileUseCase } from '../../../core/users/use-cases/get-user-profile.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('GetUserProfileHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const getUserProfileHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/users/profile'

  try {
    logger.info('Get user profile request', {
      userId: event.user?.userId
    })

    const useCase = container.get<GetUserProfileUseCase>(TYPES.GetUserProfileUseCase)
    const result = await useCase.execute({
      userId: event.user!.userId
    })

    logger.info('User profile retrieved', {
      userId: result.id
    })

    return createSuccessResponse(
      result,
      'User profile retrieved successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Get user profile failed', error, {
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(getUserProfileHandler)
  .use(authMiddleware())
  .use(httpErrorHandler())
