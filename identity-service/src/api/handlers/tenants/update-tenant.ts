import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { container } from '../../../shared/container/container.js'
import { TYPES } from '../../../shared/container/types.js'
import { UpdateTenantUseCase } from '../../../core/tenants/use-cases/update-tenant.use-case.js'
import { initializeDynamoDB } from '../../../infrastructure/database/dynamodb.config.js'
import { authMiddleware, AuthenticatedEvent } from '../../../shared/middlewares/auth.middleware.js'
import { zodValidator, ValidatedEvent } from '../../../shared/middlewares/zod-validator.middleware.js'
import { updateTenantSchema } from '../../schemas/tenant.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../../../shared/utils/response.utils.js'
import { Logger } from '../../../shared/utils/logger.js'

const logger = Logger.of('UpdateTenantHandler')

// Initialize DynamoDB connection
initializeDynamoDB()

// Combine AuthenticatedEvent with ValidatedEvent
type UpdateTenantEvent = AuthenticatedEvent & ValidatedEvent

const updateTenantHandler = async (
  event: UpdateTenantEvent
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || '/tenants/me'

  try {
    logger.info('Update tenant request', {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId,
      role: event.user?.role
    })

    const useCase = container.get<UpdateTenantUseCase>(TYPES.UpdateTenantUseCase)
    const result = await useCase.execute({
      tenantId: event.user!.tenantId,
      requestingUserTenantId: event.user!.tenantId,
      requestingUserRole: event.user!.role,
      ...event.validatedBody
    })

    logger.info('Tenant updated', {
      tenantId: result.id
    })

    return createSuccessResponse(
      result,
      'Tenant updated successfully',
      path,
      200
    )

  } catch (error: any) {
    logger.error('Update tenant failed', error, {
      tenantId: event.user?.tenantId,
      userId: event.user?.userId
    })
    return createErrorResponse(error, path)
  }
}

export const handler = middy(updateTenantHandler)
  .use(authMiddleware())
  .use(zodValidator({ body: updateTenantSchema }))
  .use(httpErrorHandler())
