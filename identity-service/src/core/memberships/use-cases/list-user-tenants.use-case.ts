import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserTenantMembershipRepository } from '../repositories/user-tenant-membership.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { UserRole } from '../../users/enums/user-role.enum.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface ListUserTenantsInput {
  userId: string
}

export interface TenantWithRole {
  tenant: {
    id: string
    name: string
    status: string
    planSlug: string
  }
  role: UserRole
  isDefault: boolean
  joinedAt: Date
}

export interface ListUserTenantsOutput {
  tenants: TenantWithRole[]
}

@injectable()
export class ListUserTenantsUseCase {
  private readonly logger = Logger.of('ListUserTenantsUseCase')

  constructor(
    @inject(TYPES.UserTenantMembershipRepository)
    private membershipRepository: UserTenantMembershipRepository,
    @inject(TYPES.TenantRepository)
    private tenantRepository: TenantRepository
  ) {}

  async execute(input: ListUserTenantsInput): Promise<ListUserTenantsOutput> {
    this.logger.info('Listing tenants for user', { userId: input.userId })

    const memberships = await this.membershipRepository.findByUserId(input.userId)

    const tenants = await Promise.all(
      memberships.map(async (membership) => {
        const tenant = await this.tenantRepository.findById(membership.tenantId)

        if (!tenant) {
          this.logger.warn('Tenant not found for membership', {
            userId: input.userId,
            tenantId: membership.tenantId
          })
          return null
        }

        const result: TenantWithRole = {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            planSlug: tenant.planSlug
          },
          role: membership.role,
          isDefault: membership.isDefault,
          joinedAt: membership.joinedAt
        }
        return result
      })
    )

    const validTenants = tenants.filter((t): t is TenantWithRole => t !== null)

    this.logger.info('Tenants listed successfully', {
      userId: input.userId,
      count: validTenants.length
    })

    return { tenants: validTenants }
  }
}
