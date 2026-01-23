import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { UpdateUserProfileUseCase } from '../../../core/users/use-cases/update-user-profile.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { updateUserProfileSchema } from '../../schemas/user.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('UpdateUserProfileHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type UpdateProfileEvent = AuthenticatedEvent & ValidatedEvent

const updateUserProfileHandler = async (
  event: UpdateProfileEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/users/profile'

  try {
    logger.info('Update user profile request', {
      userId: event.user?.userId,
      fields: Object.keys(event.validatedBody || {})
    })

    const useCase = container.get<UpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase)
    const result = await useCase.execute({
      userId: event.user!.userId,
      ...event.validatedBody
    })

    logger.info('User profile updated', {
      userId: result.id,
      emailChanged: event.validatedBody?.email !== undefined
    })

    return createSuccessResponse(
      result,
      'User profile updated successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Update user profile failed', error, {
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(updateUserProfileHandler)
  .use(authMiddleware())
  .use(zodValidator({ body: updateUserProfileSchema }))
  .use(httpErrorHandler())
