import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { RegisterUserUseCase } from '../../../core/auth/use-cases/register-user.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { registerSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('RegisterHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const registerHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/register'

  try {
    logger.info('Register request received', {
      email: event.validatedBody?.email
    })

    const useCase = container.get<RegisterUserUseCase>(TYPES.RegisterUserUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('User registered successfully', {
      userId: result.userId,
      email: result.email
    })

    return createSuccessResponse(
      result,
      'User registered successfully. Please check your email to verify your account.',
      path,
      201
    )

  } catch (error: any) {
    logger.error('Register failed', error, {
      email: event.validatedBody?.email
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(registerHandler)
  .use(zodValidator({ body: registerSchema }))
  .use(httpErrorHandler())
