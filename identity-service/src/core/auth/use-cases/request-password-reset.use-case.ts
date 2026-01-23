import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { PasswordResetToken } from '../entities/password-reset-token.entity.js'
import { Logger } from '../../../shared/utils/logger.js'
import { generateVerificationCode, calculateCodeExpiration } from '../../../shared/utils/verification-code.utils.js'
import { config } from '../../../shared/config/environment.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, PasswordResetRequestedEvent } from '../../../shared/events/event-types.js'

export interface RequestPasswordResetInput {
  email: string
}

export interface RequestPasswordResetOutput {
  success: boolean
  message: string
}

@injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = Logger.of('RequestPasswordResetUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordResetTokenRepository) private passwordResetTokenRepository: PasswordResetTokenRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<RequestPasswordResetOutput> {
    this.logger.info('Password reset requested', { email: input.email })

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email)

    // Security: Don't reveal if email exists or not
    // Always return success to prevent user enumeration
    if (!user) {
      this.logger.info('Password reset requested for non-existent email', { email: input.email })
      return {
        success: true,
        message: 'If your email is registered, you will receive a password reset code'
      }
    }

    // Generate reset code
    const resetCode = generateVerificationCode(config.PASSWORD_RESET_CODE_LENGTH)
    const expiresAt = calculateCodeExpiration(config.PASSWORD_RESET_EXPIRATION_MINUTES)

    // Delete any existing password reset tokens for this user
    await this.passwordResetTokenRepository.deleteByEmail(user.email)

    // Create new password reset token
    const resetToken = new PasswordResetToken({
      email: user.email,
      code: resetCode,
      expiresAt,
      used: false,
      resendCount: 0,
      createdAt: new Date()
    })

    await this.passwordResetTokenRepository.save(resetToken)

    this.logger.info('Password reset token created', {
      email: user.email,
      userId: user.id
    })

    // Publish PasswordResetRequested event
    await this.publishPasswordResetEvent(user.email, user.fullName, resetCode, expiresAt)

    return {
      success: true,
      message: 'If your email is registered, you will receive a password reset code'
    }
  }

  private async publishPasswordResetEvent(
    email: string,
    fullName: string,
    code: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      const event: PasswordResetRequestedEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'PasswordResetRequested',
        data: {
          email,
          fullName,
          resetCode: code,
          expiresAt: expiresAt.toISOString(),
          template: 'password-reset',
          templateData: {
            userName: fullName,
            code,
            expiresInMinutes: config.PASSWORD_RESET_EXPIRATION_MINUTES
          }
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('PasswordResetRequested event published', { email })
    } catch (error: any) {
      this.logger.error('Failed to publish PasswordResetRequested event', error, { email })
      // Don't fail the request if event publishing fails
    }
  }
}
