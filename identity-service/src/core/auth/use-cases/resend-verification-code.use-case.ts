import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { User } from '../../users/entities/user.entity.js'
import { BadRequestException, NotFoundException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { generateVerificationCode, calculateCodeExpiration } from '../../../shared/utils/verification-code.utils.js'
import { config } from '../../../shared/config/environment.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, EmailVerificationRequestedEvent } from '../../../shared/events/event-types.js'

export interface ResendVerificationCodeInput {
  email: string
}

export interface ResendVerificationCodeOutput {
  success: boolean
  message: string
  expiresAt: string
}

@injectable()
export class ResendVerificationCodeUseCase {
  private readonly logger = Logger.of('ResendVerificationCodeUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: ResendVerificationCodeInput): Promise<ResendVerificationCodeOutput> {
    this.logger.info('Resending verification code', { email: input.email })

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      this.logger.warn('Resend verification failed: user not found', { email: input.email })
      throw new NotFoundException('User not found')
    }

    // Check if email is already verified
    if (user.emailVerified) {
      this.logger.info('Email already verified', { email: input.email, userId: user.id })
      throw new BadRequestException('Email is already verified')
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode(config.EMAIL_VERIFICATION_CODE_LENGTH)
    const verificationExpiresAt = calculateCodeExpiration(config.EMAIL_VERIFICATION_EXPIRATION_MINUTES)

    // Update user with new verification code
    const updatedUser = new User({
      ...user,
      emailVerificationCode: verificationCode,
      emailVerificationExpiresAt: verificationExpiresAt,
      updatedAt: new Date()
    })

    await this.userRepository.save(updatedUser)

    this.logger.info('Verification code regenerated', {
      userId: user.id,
      email: user.email
    })

    // Publish EmailVerificationRequested event
    await this.publishEmailVerificationEvent(updatedUser, verificationCode)

    return {
      success: true,
      message: 'Verification code has been resent',
      expiresAt: verificationExpiresAt.toISOString()
    }
  }

  private async publishEmailVerificationEvent(user: User, code: string): Promise<void> {
    try {
      const event: EmailVerificationRequestedEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'EmailVerificationRequested',
        data: {
          email: user.email,
          fullName: user.fullName,
          verificationCode: code,
          expiresAt: user.emailVerificationExpiresAt!.toISOString(),
          template: 'email-verification',
          templateData: {
            userName: user.fullName,
            code,
            expiresInMinutes: config.EMAIL_VERIFICATION_EXPIRATION_MINUTES
          }
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('EmailVerificationRequested event published', {
        userId: user.id
      })
    } catch (error: any) {
      this.logger.error('Failed to publish EmailVerificationRequested event', error, {
        userId: user.id
      })
      // Don't fail the resend if event publishing fails
    }
  }
}
