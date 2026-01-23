import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface GetTenantMembersInput {
  tenantId: string
  requestingUserTenantId: string
}

export interface TenantMember {
  id: string
  email: string
  fullName: string
  role: string
  emailVerified: boolean
  createdAt: string
}

export interface GetTenantMembersOutput {
  members: TenantMember[]
  total: number
}

@injectable()
export class GetTenantMembersUseCase {
  private readonly logger = Logger.of('GetTenantMembersUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async execute(input: GetTenantMembersInput): Promise<GetTenantMembersOutput> {
    this.logger.info('Getting tenant members', { tenantId: input.tenantId })

    // Authorization: User can only view members of their own tenant
    if (input.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized tenant members access attempt', {
        requestedTenantId: input.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only view members of your own organization')
    }

    // Find all users in the tenant
    const users = await this.userRepository.findByTenantId(input.tenantId)

    // Filter out soft-deleted users and map to response format
    const activeMembers = users
      .filter(user => !user.deletedAt)
      .map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString()
      }))

    // Sort by role (OWNER first, then ADMIN, then MEMBER) and then by createdAt
    const roleOrder = { OWNER: 1, ADMIN: 2, MEMBER: 3 }
    activeMembers.sort((a, b) => {
      const roleComparison = (roleOrder[a.role as keyof typeof roleOrder] || 999) -
                             (roleOrder[b.role as keyof typeof roleOrder] || 999)
      if (roleComparison !== 0) return roleComparison
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    this.logger.info('Tenant members retrieved', {
      tenantId: input.tenantId,
      count: activeMembers.length
    })

    return {
      members: activeMembers,
      total: activeMembers.length
    }
  }
}
