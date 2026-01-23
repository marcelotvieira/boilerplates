import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { LoginUseCase } from '../../../core/auth/use-cases/login.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { loginSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('LoginHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const loginHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/login'

  try {
    logger.info('Login request received', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<LoginUseCase>(TYPES.LoginUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Login successful', {
      userId: result.user.id,
      email: result.user.email
    })

    return createSuccessResponse(
      result,
      'Login successful',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Login failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(loginHandler)
  .use(zodValidator({ body: loginSchema }))
  .use(httpErrorHandler())
