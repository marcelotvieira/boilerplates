import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { InviteRepository } from '../repositories/invite.repository.interface.js'
import { ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface ListTenantInvitesInput {
  tenantId: string
  requestingUserTenantId: string
}

export interface InviteItem {
  token: string
  email: string
  role: string
  status: string
  expiresAt: string
  createdAt: string
}

export interface ListTenantInvitesOutput {
  invites: InviteItem[]
  total: number
}

@injectable()
export class ListTenantInvitesUseCase {
  private readonly logger = Logger.of('ListTenantInvitesUseCase')

  constructor(
    @inject(TYPES.InviteRepository) private inviteRepository: InviteRepository
  ) {}

  async execute(input: ListTenantInvitesInput): Promise<ListTenantInvitesOutput> {
    this.logger.info('Listing tenant invites', { tenantId: input.tenantId })

    // Authorization: User can only list invites from their own tenant
    if (input.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized invite list attempt', {
        requestedTenantId: input.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only view invites from your own organization')
    }

    // Find all invites for the tenant
    const invites = await this.inviteRepository.findByTenantId(input.tenantId)

    // Map to response format
    const inviteItems = invites.map(invite => ({
      token: invite.token,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString()
    }))

    // Sort by createdAt (most recent first)
    inviteItems.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    this.logger.info('Tenant invites retrieved', {
      tenantId: input.tenantId,
      count: inviteItems.length
    })

    return {
      invites: inviteItems,
      total: inviteItems.length
    }
  }
}
