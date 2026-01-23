import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { InviteRepository } from '../repositories/invite.repository.interface.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { PasswordHasher } from '../../../infrastructure/adapters/bcrypt-password-hasher.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { User } from '../../users/entities/user.entity.js'
import { Invite } from '../entities/invite.entity.js'
import { InviteStatus } from '../enums/invite-status.enum.js'
import { NotFoundException, BadRequestException, ConflictException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, UserRegisteredEvent } from '../../../shared/events/event-types.js'

export interface AcceptInviteInput {
  token: string
  fullName: string
  password: string
}

export interface AcceptInviteOutput {
  userId: string
  email: string
  fullName: string
  tenantId: string
  role: string
}

@injectable()
export class AcceptInviteUseCase {
  private readonly logger = Logger.of('AcceptInviteUseCase')

  constructor(
    @inject(TYPES.InviteRepository) private inviteRepository: InviteRepository,
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: AcceptInviteInput): Promise<AcceptInviteOutput> {
    this.logger.info('Accepting invite', { token: input.token })

    // Find invite by token
    const invite = await this.inviteRepository.findByToken(input.token)
    if (!invite) {
      this.logger.warn('Invite not found', { token: input.token })
      throw new NotFoundException('Invite not found')
    }

    // Check if invite is expired
    if (invite.isExpired()) {
      this.logger.warn('Invite expired', {
        token: input.token,
        expiresAt: invite.expiresAt
      })
      throw new BadRequestException('This invite has expired')
    }

    // Check if invite is still pending
    if (!invite.isPending()) {
      this.logger.warn('Invite not pending', {
        token: input.token,
        status: invite.status
      })
      throw new BadRequestException(`This invite has already been ${invite.status.toLowerCase()}`)
    }

    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(invite.email)
    if (existingUser) {
      this.logger.warn('User already exists when accepting invite', {
        email: invite.email,
        existingUserId: existingUser.id
      })
      throw new ConflictException('A user with this email already exists')
    }

    // Verify tenant still exists
    const tenant = await this.tenantRepository.findById(invite.tenantId)
    if (!tenant) {
      this.logger.error('Tenant not found for invite', new Error('Tenant not found'), {
        tenantId: invite.tenantId,
        inviteToken: input.token
      })
      throw new NotFoundException('Organization not found')
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password)

    // Create user
    const userId = randomUUID()
    const user = new User({
      id: userId,
      fullName: input.fullName,
      email: invite.email,
      tenantId: invite.tenantId,
      passwordHash,
      role: invite.role,
      emailVerified: true, // Auto-verify email for invited users
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await this.userRepository.save(user)

    // Update invite status
    const acceptedInvite = new Invite({
      ...invite,
      status: InviteStatus.ACCEPTED,
      acceptedAt: new Date(),
      updatedAt: new Date()
    })

    await this.inviteRepository.save(acceptedInvite)

    this.logger.info('Invite accepted successfully', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      inviteToken: input.token
    })

    // Publish UserRegistered event
    await this.publishUserRegisteredEvent(user, input.token)

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      tenantId: user.tenantId,
      role: user.role
    }
  }

  private async publishUserRegisteredEvent(user: User, inviteToken: string): Promise<void> {
    try {
      const event: UserRegisteredEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'UserRegistered',
        data: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          tenantId: user.tenantId,
          role: user.role,
          registrationType: 'invite',
          inviteToken
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('UserRegistered event published', {
        userId: user.id,
        registrationType: 'invite'
      })
    } catch (error: any) {
      this.logger.error('Failed to publish UserRegistered event', error, {
        userId: user.id
      })
      // Don't fail the registration if event publishing fails
    }
  }
}
