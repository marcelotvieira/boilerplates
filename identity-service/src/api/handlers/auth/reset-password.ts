import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { ResetPasswordUseCase } from '../../../core/auth/use-cases/reset-password.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { resetPasswordSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('ResetPasswordHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const resetPasswordHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/reset-password'

  try {
    logger.info('Password reset attempt', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Password reset successful', {
      email: event.validatedBody?.email
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Password reset failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(resetPasswordHandler)
  .use(zodValidator({ body: resetPasswordSchema }))
  .use(httpErrorHandler())
