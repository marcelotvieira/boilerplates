import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { InviteRepository } from '../repositories/invite.repository.interface.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { Invite } from '../entities/invite.entity.js'
import { UserRole } from '../../users/enums/user-role.enum.js'
import { InviteStatus } from '../enums/invite-status.enum.js'
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { config } from '../../../shared/config/environment.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, InviteCreatedEvent } from '../../../shared/events/event-types.js'

export interface CreateInviteInput {
  email: string
  role: string
  requestingUserId: string
  requestingUserTenantId: string
  requestingUserRole: string
}

export interface CreateInviteOutput {
  token: string
  email: string
  role: string
  status: string
  expiresAt: string
  inviteLink: string
}

@injectable()
export class CreateInviteUseCase {
  private readonly logger = Logger.of('CreateInviteUseCase')

  constructor(
    @inject(TYPES.InviteRepository) private inviteRepository: InviteRepository,
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: CreateInviteInput): Promise<CreateInviteOutput> {
    this.logger.info('Creating invite', {
      email: input.email,
      role: input.role,
      requestingUserId: input.requestingUserId
    })

    // Only OWNERs and ADMINs can create invites
    if (input.requestingUserRole !== UserRole.OWNER && input.requestingUserRole !== UserRole.ADMIN) {
      this.logger.warn('Insufficient permissions to create invite', {
        requestingUserId: input.requestingUserId,
        requestingUserRole: input.requestingUserRole
      })
      throw new ForbiddenException('Only owners and administrators can invite new members')
    }

    // Validate role
    const validRoles = [UserRole.ADMIN, UserRole.MEMBER]
    if (!validRoles.includes(input.role as UserRole)) {
      this.logger.warn('Invalid invite role', { role: input.role })
      throw new BadRequestException('Invalid role. Only ADMIN and MEMBER roles can be invited.')
    }

    // Only OWNERs can invite ADMINs
    if (input.role === UserRole.ADMIN && input.requestingUserRole !== UserRole.OWNER) {
      this.logger.warn('Non-owner attempting to invite admin', {
        requestingUserId: input.requestingUserId,
        requestingUserRole: input.requestingUserRole
      })
      throw new ForbiddenException('Only account owners can invite administrators')
    }

    // Check if email is already registered
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      this.logger.warn('Invite attempt for existing user', {
        email: input.email,
        existingUserId: existingUser.id
      })
      throw new ConflictException('A user with this email already exists')
    }

    // Check if there's already a pending invite for this email and tenant
    const existingInvite = await this.inviteRepository.findByEmailAndTenant(
      input.email,
      input.requestingUserTenantId
    )

    if (existingInvite && existingInvite.isPending()) {
      this.logger.warn('Pending invite already exists', {
        email: input.email,
        tenantId: input.requestingUserTenantId
      })
      throw new ConflictException('An active invite for this email already exists')
    }

    // Get tenant and inviter details
    const tenant = await this.tenantRepository.findById(input.requestingUserTenantId)
    if (!tenant) {
      this.logger.error('Tenant not found', new Error('Tenant not found'), {
        tenantId: input.requestingUserTenantId
      })
      throw new NotFoundException('Organization not found')
    }

    const inviter = await this.userRepository.findById(input.requestingUserId)
    if (!inviter) {
      this.logger.error('Inviter not found', new Error('Inviter not found'), {
        userId: input.requestingUserId
      })
      throw new NotFoundException('User not found')
    }

    // Create invite
    const inviteToken = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + config.INVITE_EXPIRATION_DAYS)

    const invite = new Invite({
      token: inviteToken,
      tenantId: input.requestingUserTenantId,
      email: input.email,
      role: input.role as UserRole,
      status: InviteStatus.PENDING,
      expiresAt,
      createdBy: input.requestingUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await this.inviteRepository.save(invite)

    this.logger.info('Invite created successfully', {
      token: invite.token,
      email: invite.email,
      tenantId: invite.tenantId
    })

    // Generate invite link
    const inviteLink = `${config.FRONTEND_URL}${config.INVITE_ACCEPT_PATH}?token=${inviteToken}`

    // Publish InviteCreated event
    await this.publishInviteCreatedEvent(invite, tenant.name, inviter.fullName, inviteLink)

    return {
      token: invite.token,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      inviteLink
    }
  }

  private async publishInviteCreatedEvent(
    invite: Invite,
    tenantName: string,
    inviterName: string,
    inviteLink: string
  ): Promise<void> {
    try {
      const event: InviteCreatedEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'InviteCreated',
        data: {
          inviteToken: invite.token,
          email: invite.email,
          tenantId: invite.tenantId,
          tenantName,
          role: invite.role,
          invitedBy: invite.createdBy,
          inviteLink,
          expiresAt: invite.expiresAt.toISOString(),
          template: 'invite',
          templateData: {
            recipientEmail: invite.email,
            tenantName,
            invitedByName: inviterName,
            role: invite.role,
            inviteLink,
            expiresInDays: config.INVITE_EXPIRATION_DAYS
          }
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('InviteCreated event published', {
        inviteToken: invite.token,
        email: invite.email
      })
    } catch (error: any) {
      this.logger.error('Failed to publish InviteCreated event', error, {
        inviteToken: invite.token
      })
      // Don't fail the invite creation if event publishing fails
    }
  }
}
