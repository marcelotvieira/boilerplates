import middy from '@middy/core'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { JwtUtils, TokenPayload } from '../utils/jwt.utils.js'
import { UnauthorizedException } from '../exceptions/app.exceptions.js'
import { createErrorResponse } from '../utils/response.utils.js'
import { Logger } from '../utils/logger.js'

const logger = Logger.of('AuthMiddleware')

export interface AuthenticatedEvent extends APIGatewayProxyEventV2 {
  user?: TokenPayload
}

/**
 * Authentication Middleware
 * Validates JWT token from Authorization header and attaches user data to event
 */
export const authMiddleware = (): middy.MiddlewareObj<
  AuthenticatedEvent,
  APIGatewayProxyResultV2
> => {
  const before: middy.MiddlewareFn<AuthenticatedEvent, APIGatewayProxyResultV2> = async (
    request
  ): Promise<void | APIGatewayProxyResultV2> => {
    try {
      const { event } = request
      const path = event.rawPath || event.requestContext?.http?.path || 'unknown'

      // Extract token from Authorization header
      const authHeader = event.headers?.authorization || event.headers?.Authorization

      if (!authHeader) {
        logger.warn('Missing authorization header', { path })
        return createErrorResponse(
          new UnauthorizedException('Missing authorization header'),
          path
        )
      }

      // Validate Bearer format
      const parts = authHeader.split(' ')
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        logger.warn('Invalid authorization header format', { path })
        return createErrorResponse(
          new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>'),
          path
        )
      }

      const token = parts[1]

      // Verify and decode token
      try {
        const payload = JwtUtils.verifyToken(token)

        // Attach user data to event
        event.user = payload

        logger.debug('Token verified successfully', {
          userId: payload.userId,
          tenantId: payload.tenantId,
          role: payload.role,
          path
        })

      } catch (error: any) {
        logger.warn('Token verification failed', {
          error: error.message,
          path
        })

        if (error.name === 'TokenExpiredError') {
          return createErrorResponse(
            new UnauthorizedException('Token has expired'),
            path
          )
        }

        if (error.name === 'JsonWebTokenError') {
          return createErrorResponse(
            new UnauthorizedException('Invalid token'),
            path
          )
        }

        return createErrorResponse(
          new UnauthorizedException('Token verification failed'),
          path
        )
      }

    } catch (error: any) {
      logger.error('Unexpected error in auth middleware', error)
      return createErrorResponse(error, 'unknown')
    }
  }

  return {
    before
  }
}

/**
 * Role-based Authorization Middleware
 * Validates that the authenticated user has one of the required roles
 */
export const requireRole = (
  ...allowedRoles: string[]
): middy.MiddlewareObj<AuthenticatedEvent, APIGatewayProxyResultV2> => {
  const before: middy.MiddlewareFn<AuthenticatedEvent, APIGatewayProxyResultV2> = async (
    request
  ): Promise<void | APIGatewayProxyResultV2> => {
    const { event } = request
    const path = event.rawPath || event.requestContext?.http?.path || 'unknown'

    if (!event.user) {
      logger.error('User not found in event context. Auth middleware must run first.')
      return createErrorResponse(
        new UnauthorizedException('Authentication required'),
        path
      )
    }

    const userRole = event.user.role

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', {
        userId: event.user.userId,
        userRole,
        requiredRoles: allowedRoles,
        path
      })

      return createErrorResponse(
        new UnauthorizedException(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`),
        path
      )
    }

    logger.debug('Role check passed', {
      userId: event.user.userId,
      userRole,
      path
    })
  }

  return {
    before
  }
}
