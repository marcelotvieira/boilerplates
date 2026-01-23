import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { ChangePasswordUseCase } from '../../../core/users/use-cases/change-password.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { changePasswordSchema } from '../../schemas/user.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('ChangePasswordHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type ChangePasswordEvent = AuthenticatedEvent & ValidatedEvent

const changePasswordHandler = async (
  event: ChangePasswordEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/users/change-password'

  try {
    logger.info('Change password request', {
      userId: event.user?.userId
    })

    const useCase = container.get<ChangePasswordUseCase>(TYPES.ChangePasswordUseCase)
    const result = await useCase.execute({
      userId: event.user!.userId,
      ...event.validatedBody
    })

    logger.info('Password changed successfully', {
      userId: event.user?.userId
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Change password failed', error, {
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(changePasswordHandler)
  .use(authMiddleware())
  .use(zodValidator({ body: changePasswordSchema }))
  .use(httpErrorHandler())
