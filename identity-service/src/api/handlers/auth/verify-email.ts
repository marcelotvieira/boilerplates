import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { VerifyEmailUseCase } from '../../../core/auth/use-cases/verify-email.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { verifyEmailSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('VerifyEmailHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const verifyEmailHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/verify-email'

  try {
    logger.info('Email verification request received', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<VerifyEmailUseCase>(TYPES.VerifyEmailUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Email verified successfully', {
      email: event.validatedBody?.email
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Email verification failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(verifyEmailHandler)
  .use(zodValidator({ body: verifyEmailSchema }))
  .use(httpErrorHandler())
