import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { LogoutUseCase } from '../../../core/auth/use-cases/logout.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { logoutSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('LogoutHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const logoutHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/logout'

  try {
    logger.info('Logout request received')

    const useCase = container.get<LogoutUseCase>(TYPES.LogoutUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Logout successful')

    return createSuccessResponse(
      result,
      result.message,
      path,
      200
    )

  } catch (error: any) {
    logger.error('Logout failed', error)
    return createErrorResponse(error, path)
  }
}

export const handler = middy(logoutHandler)
  .use(zodValidator({ body: logoutSchema }))
  .use(httpErrorHandler())
