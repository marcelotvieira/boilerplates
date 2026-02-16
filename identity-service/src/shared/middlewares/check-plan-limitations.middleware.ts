import middy from '@middy/core'
import { APIGatewayProxyResultV2 } from 'aws-lambda'
import { AuthenticatedEvent } from './auth.middleware.js'
import { ForbiddenException } from '../exceptions/app.exceptions.js'
import { createErrorResponse } from '../utils/response.utils.js'
import { Logger } from '../utils/logger.js'

const logger = Logger.of('CheckPlanLimitations')

export interface PlanLimitedEvent extends AuthenticatedEvent {
  resourceLimit?: number
}

/**
 * Plan Limitations Middleware
 * Verifies module access and optionally extracts a numeric limit from entitlements.
 * Must run after authMiddleware (depends on event.user).
 *
 * @param module  - The module name (e.g. 'workspace')
 * @param limitKey - Optional limit key within the module (e.g. 'members')
 */
export const checkPlanLimitations = (
  module: string,
  limitKey?: string
): middy.MiddlewareObj<PlanLimitedEvent, APIGatewayProxyResultV2> => {
  const before: middy.MiddlewareFn<PlanLimitedEvent, APIGatewayProxyResultV2> = async (
    request
  ): Promise<void | APIGatewayProxyResultV2> => {
    const { event } = request
    const path = event.rawPath || event.requestContext?.http?.path || 'unknown'
    const entitlements = event.user?.entitlements

    if (!entitlements) {
      logger.warn('No entitlements found in token', { path, module })
      return createErrorResponse(
        new ForbiddenException('No entitlements available'),
        path
      )
    }

    const moduleConfig = entitlements[module]
    if (!moduleConfig) {
      logger.warn('Module not available in plan', { path, module })
      return createErrorResponse(
        new ForbiddenException('This feature is not available in your plan'),
        path
      )
    }

    if (limitKey) {
      const limitValue = moduleConfig.limits?.[limitKey]
      if (limitValue === undefined) {
        logger.warn('Limit not found in module', { path, module, limitKey })
        return createErrorResponse(
          new ForbiddenException('This feature is not available in your plan'),
          path
        )
      }

      event.resourceLimit = limitValue
      logger.debug('Plan limitation resolved', { module, limitKey, limit: limitValue, path })
    } else {
      logger.debug('Module access confirmed', { module, path })
    }
  }

  return { before }
}
