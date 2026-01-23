import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { ResendVerificationCodeUseCase } from '../../../core/auth/use-cases/resend-verification-code.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { resendVerificationCodeSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('ResendVerificationCodeHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const resendVerificationCodeHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/resend-verification-code'

  try {
    logger.info('Resend verification code request received', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<ResendVerificationCodeUseCase>(TYPES.ResendVerificationCodeUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Verification code resent successfully', {
      email: event.validatedBody?.email
    })

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Resend verification code failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(resendVerificationCodeHandler)
  .use(zodValidator({ body: resendVerificationCodeSchema }))
  .use(httpErrorHandler())
