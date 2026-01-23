import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { RefreshTokenUseCase } from '../../../core/auth/use-cases/refresh-token.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { refreshTokenSchema } from '../../schemas/auth.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('RefreshTokenHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

const refreshTokenHandler = async (
  event: ValidatedEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/auth/refresh-token'

  try {
    logger.info('Token refresh request received')

    const useCase = container.get<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase)
    const result = await useCase.execute(event.validatedBody)

    logger.info('Token refreshed successfully', {
      userId: result.user.id
    })

    return createSuccessResponse(
      result,
      'Token refreshed successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Token refresh failed', error)
    return createErrorResponse(error, path)
  }
}

export const handler = middy(refreshTokenHandler)
  .use(zodValidator({ body: refreshTokenSchema }))
  .use(httpErrorHandler())
