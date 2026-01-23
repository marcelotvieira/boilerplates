import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { User } from '../../users/entities/user.entity.js'
import { BadRequestException, NotFoundException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { isCodeExpired } from '../../../shared/utils/verification-code.utils.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, UserEmailVerifiedEvent } from '../../../shared/events/event-types.js'

export interface VerifyEmailInput {
  email: string
  code: string
}

export interface VerifyEmailOutput {
  success: boolean
  message: string
}

@injectable()
export class VerifyEmailUseCase {
  private readonly logger = Logger.of('VerifyEmailUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    this.logger.info('Starting email verification', { email: input.email })

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      this.logger.warn('Email verification failed: user not found', { email: input.email })
      throw new NotFoundException('User not found')
    }

    // Check if email is already verified
    if (user.emailVerified) {
      this.logger.info('Email already verified', { email: input.email, userId: user.id })
      return {
        success: true,
        message: 'Email already verified'
      }
    }

    // Check if verification code exists
    if (!user.emailVerificationCode) {
      this.logger.warn('No verification code found for user', { email: input.email, userId: user.id })
      throw new BadRequestException('No verification code found. Please request a new one.')
    }

    // Verify code matches
    if (user.emailVerificationCode !== input.code) {
      this.logger.warn('Invalid verification code', { email: input.email, userId: user.id })
      throw new BadRequestException('Invalid verification code')
    }

    // Check if code is expired
    if (!user.emailVerificationExpiresAt || isCodeExpired(user.emailVerificationExpiresAt)) {
      this.logger.warn('Verification code expired', { email: input.email, userId: user.id })
      throw new BadRequestException('Verification code has expired. Please request a new one.')
    }

    // Update user - mark email as verified and clear verification code
    const updatedUser = new User({
      ...user,
      emailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExpiresAt: undefined,
      updatedAt: new Date()
    })

    await this.userRepository.save(updatedUser)

    this.logger.info('Email verified successfully', {
      userId: user.id,
      email: user.email
    })

    // Publish UserEmailVerified event (triggers Subscription Service to create FREE plan)
    await this.publishUserEmailVerifiedEvent(updatedUser)

    return {
      success: true,
      message: 'Email verified successfully'
    }
  }

  private async publishUserEmailVerifiedEvent(user: User): Promise<void> {
    try {
      // Get tenant for tenant name
      const tenant = await this.tenantRepository.findById(user.tenantId)
      if (!tenant) {
        this.logger.error('Tenant not found when publishing event', new Error('Tenant not found'), {
          userId: user.id,
          tenantId: user.tenantId
        })
        return
      }

      const event: UserEmailVerifiedEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'UserEmailVerified',
        data: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          tenantId: user.tenantId,
          tenantName: tenant.name,
          role: 'OWNER'
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('UserEmailVerified event published', {
        userId: user.id,
        tenantId: user.tenantId
      })
    } catch (error: any) {
      this.logger.error('Failed to publish UserEmailVerified event', error, {
        userId: user.id
      })
      // Don't fail the verification if event publishing fails
    }
  }
}
