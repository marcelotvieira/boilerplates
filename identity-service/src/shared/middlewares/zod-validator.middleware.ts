import middy from '@middy/core'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { z, ZodSchema } from 'zod'
import { BadRequestException, ValidationException } from '../exceptions/app.exceptions.js'
import { createErrorResponse } from '../utils/response.utils.js'
import { Logger } from '../utils/logger.js'

const logger = Logger.of('ZodValidatorMiddleware')

export interface ValidatedEvent extends APIGatewayProxyEventV2 {
  validatedBody?: any
  validatedQuery?: any
  validatedPath?: any
}

export interface ValidationSchemas {
  body?: ZodSchema
  queryStringParameters?: ZodSchema
  pathParameters?: ZodSchema
}

/**
 * Zod Validation Middleware
 * Validates request body, query parameters, and path parameters against Zod schemas
 */
export const zodValidator = (
  schemas: ValidationSchemas
): middy.MiddlewareObj<ValidatedEvent, APIGatewayProxyResultV2> => {
  const before: middy.MiddlewareFn<ValidatedEvent, APIGatewayProxyResultV2> = async (
    request
  ): Promise<void | APIGatewayProxyResultV2> => {
    try {
      const { event } = request
      const path = event.rawPath || event.requestContext?.http?.path || 'unknown'

      // Validate body
      if (schemas.body) {
        let bodyData: any

        try {
          // Parse JSON body if it's a string
          if (typeof event.body === 'string') {
            bodyData = event.body ? JSON.parse(event.body) : {}
          } else {
            bodyData = event.body || {}
          }
        } catch (error) {
          logger.warn('Invalid JSON in request body', { path })
          return createErrorResponse(
            new BadRequestException('Invalid JSON in request body'),
            path
          )
        }

        try {
          const validated = schemas.body.parse(bodyData)
          event.validatedBody = validated

          logger.debug('Body validation successful', { path })

        } catch (error: any) {
          if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))

            logger.warn('Body validation failed', {
              path,
              errors: formattedErrors
            })

            return createErrorResponse(
              new ValidationException('Validation failed', undefined, { errors: formattedErrors }),
              path
            )
          }
          throw error
        }
      }

      // Validate query parameters
      if (schemas.queryStringParameters) {
        try {
          const queryData = event.queryStringParameters || {}
          const validated = schemas.queryStringParameters.parse(queryData)
          event.validatedQuery = validated

          logger.debug('Query parameters validation successful', { path })

        } catch (error: any) {
          if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))

            logger.warn('Query parameters validation failed', {
              path,
              errors: formattedErrors
            })

            return createErrorResponse(
              new ValidationException('Invalid query parameters', undefined, { errors: formattedErrors }),
              path
            )
          }
          throw error
        }
      }

      // Validate path parameters
      if (schemas.pathParameters) {
        try {
          const pathData = event.pathParameters || {}
          const validated = schemas.pathParameters.parse(pathData)
          event.validatedPath = validated

          logger.debug('Path parameters validation successful', { path })

        } catch (error: any) {
          if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))

            logger.warn('Path parameters validation failed', {
              path,
              errors: formattedErrors
            })

            return createErrorResponse(
              new ValidationException('Invalid path parameters', undefined, { errors: formattedErrors }),
              path
            )
          }
          throw error
        }
      }

    } catch (error: any) {
      logger.error('Unexpected error in validation middleware', error)
      return createErrorResponse(error, 'unknown')
    }
  }

  return {
    before
  }
}
