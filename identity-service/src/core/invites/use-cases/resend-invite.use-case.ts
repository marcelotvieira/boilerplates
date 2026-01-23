import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { InviteRepository } from '../repositories/invite.repository.interface.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { NotFoundException, ForbiddenException, BadRequestException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { UserRole } from '../../users/enums/user-role.enum.js'
import { config } from '../../../shared/config/environment.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, InviteCreatedEvent } from '../../../shared/events/event-types.js'

export interface ResendInviteInput {
  token: string
  requestingUserId: string
  requestingUserTenantId: string
  requestingUserRole: string
}

export interface ResendInviteOutput {
  success: boolean
  message: string
}

@injectable()
export class ResendInviteUseCase {
  private readonly logger = Logger.of('ResendInviteUseCase')

  constructor(
    @inject(TYPES.InviteRepository) private inviteRepository: InviteRepository,
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: ResendInviteInput): Promise<ResendInviteOutput> {
    this.logger.info('Resending invite', { token: input.token })

    // Find invite
    const invite = await this.inviteRepository.findByToken(input.token)
    if (!invite) {
      this.logger.warn('Invite not found', { token: input.token })
      throw new NotFoundException('Invite not found')
    }

    // Authorization: User can only resend invites from their own tenant
    if (invite.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized invite resend attempt', {
        inviteToken: input.token,
        inviteTenantId: invite.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only resend invites from your own organization')
    }

    // Only OWNERs and ADMINs can resend invites
    if (input.requestingUserRole !== UserRole.OWNER && input.requestingUserRole !== UserRole.ADMIN) {
      this.logger.warn('Insufficient permissions to resend invite', {
        token: input.token,
        userRole: input.requestingUserRole
      })
      throw new ForbiddenException('Only owners and administrators can resend invites')
    }

    // Check if invite is pending
    if (!invite.isPending()) {
      this.logger.warn('Invite not pending', {
        token: input.token,
        status: invite.status
      })
      throw new BadRequestException(`Cannot resend invite with status: ${invite.status}`)
    }

    // Check if invite is expired
    if (invite.isExpired()) {
      this.logger.warn('Invite expired', {
        token: input.token,
        expiresAt: invite.expiresAt
      })
      throw new BadRequestException('This invite has expired. Please create a new one.')
    }

    // Get tenant and inviter details for the email
    const tenant = await this.tenantRepository.findById(invite.tenantId)
    if (!tenant) {
      this.logger.error('Tenant not found', new Error('Tenant not found'), {
        tenantId: invite.tenantId
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

    // Generate invite link
    const inviteLink = `${config.FRONTEND_URL}${config.INVITE_ACCEPT_PATH}?token=${invite.token}`

    // Publish InviteCreated event (resend uses same event type)
    await this.publishInviteCreatedEvent(invite, tenant.name, inviter.fullName, inviteLink)

    this.logger.info('Invite resent successfully', {
      token: input.token,
      email: invite.email
    })

    return {
      success: true,
      message: 'Invite has been resent'
    }
  }

  private async publishInviteCreatedEvent(
    invite: any,
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

      this.logger.info('InviteCreated event published (resend)', {
        inviteToken: invite.token,
        email: invite.email
      })
    } catch (error: any) {
      this.logger.error('Failed to publish InviteCreated event', error, {
        inviteToken: invite.token
      })
      // Don't fail the resend if event publishing fails
    }
  }
}
