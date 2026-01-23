import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { InviteRepository } from '../repositories/invite.repository.interface.js'
import { Invite } from '../entities/invite.entity.js'
import { InviteStatus } from '../enums/invite-status.enum.js'
import { NotFoundException, ForbiddenException, BadRequestException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { UserRole } from '../../users/enums/user-role.enum.js'

export interface CancelInviteInput {
  token: string
  requestingUserTenantId: string
  requestingUserRole: string
}

export interface CancelInviteOutput {
  success: boolean
  message: string
}

@injectable()
export class CancelInviteUseCase {
  private readonly logger = Logger.of('CancelInviteUseCase')

  constructor(
    @inject(TYPES.InviteRepository) private inviteRepository: InviteRepository
  ) {}

  async execute(input: CancelInviteInput): Promise<CancelInviteOutput> {
    this.logger.info('Canceling invite', { token: input.token })

    // Find invite
    const invite = await this.inviteRepository.findByToken(input.token)
    if (!invite) {
      this.logger.warn('Invite not found', { token: input.token })
      throw new NotFoundException('Invite not found')
    }

    // Authorization: User can only cancel invites from their own tenant
    if (invite.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized invite cancel attempt', {
        inviteToken: input.token,
        inviteTenantId: invite.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only cancel invites from your own organization')
    }

    // Only OWNERs and ADMINs can cancel invites
    if (input.requestingUserRole !== UserRole.OWNER && input.requestingUserRole !== UserRole.ADMIN) {
      this.logger.warn('Insufficient permissions to cancel invite', {
        token: input.token,
        userRole: input.requestingUserRole
      })
      throw new ForbiddenException('Only owners and administrators can cancel invites')
    }

    // Check if invite is pending
    if (!invite.isPending()) {
      this.logger.warn('Invite not pending', {
        token: input.token,
        status: invite.status
      })
      throw new BadRequestException(`Cannot cancel invite with status: ${invite.status}`)
    }

    // Update invite status to CANCELLED
    const cancelledInvite = new Invite({
      ...invite,
      status: InviteStatus.CANCELLED,
      updatedAt: new Date()
    })

    await this.inviteRepository.save(cancelledInvite)

    this.logger.info('Invite cancelled successfully', {
      token: input.token,
      email: invite.email
    })

    return {
      success: true,
      message: 'Invite has been cancelled'
    }
  }
}
