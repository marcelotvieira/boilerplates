import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { RequestPasswordResetUseCase } from '../../../core/auth/use-cases/request-password-reset.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { requestPasswordResetSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('RequestPasswordResetHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const requestPasswordResetHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/request-password-reset'

  try {
    logger.info('Password reset request received', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<RequestPasswordResetUseCase>(TYPES.RequestPasswordResetUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Password reset request processed', {
      email: event.validatedBody?.email
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Password reset request failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(requestPasswordResetHandler)
  .use(zodValidator({ body: requestPasswordResetSchema }))
  .use(httpErrorHandler())
