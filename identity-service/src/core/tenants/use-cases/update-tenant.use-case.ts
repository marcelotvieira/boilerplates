import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { TenantRepository } from '../repositories/tenant.repository.interface.js'
import { Tenant } from '../entities/tenant.entity.js'
import { NotFoundException, ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { UserRole } from '../../users/enums/user-role.enum.js'

export interface UpdateTenantInput {
  tenantId: string
  requestingUserTenantId: string
  requestingUserRole: string
  name?: string
}

export interface UpdateTenantOutput {
  id: string
  name: string
  ownerId: string
  status: string
  updatedAt: string
}

@injectable()
export class UpdateTenantUseCase {
  private readonly logger = Logger.of('UpdateTenantUseCase')

  constructor(
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository
  ) {}

  async execute(input: UpdateTenantInput): Promise<UpdateTenantOutput> {
    this.logger.info('Updating tenant', {
      tenantId: input.tenantId,
      requestingUserRole: input.requestingUserRole
    })

    // Authorization: User can only update their own tenant
    if (input.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized tenant update attempt', {
        requestedTenantId: input.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only update your own organization')
    }

    // Only OWNERs and ADMINs can update tenant
    if (input.requestingUserRole !== UserRole.OWNER && input.requestingUserRole !== UserRole.ADMIN) {
      this.logger.warn('Insufficient permissions to update tenant', {
        tenantId: input.tenantId,
        userRole: input.requestingUserRole
      })
      throw new ForbiddenException('Only owners and administrators can update organization details')
    }

    // Find tenant
    const tenant = await this.tenantRepository.findById(input.tenantId)
    if (!tenant) {
      this.logger.warn('Tenant not found', { tenantId: input.tenantId })
      throw new NotFoundException('Organization not found')
    }

    // Update tenant
    const updatedTenant = new Tenant({
      ...tenant,
      name: input.name ?? tenant.name,
      updatedAt: new Date()
    })

    await this.tenantRepository.save(updatedTenant)

    this.logger.info('Tenant updated successfully', { tenantId: tenant.id })

    return {
      id: updatedTenant.id,
      name: updatedTenant.name,
      ownerId: updatedTenant.ownerId,
      status: updatedTenant.status,
      updatedAt: updatedTenant.updatedAt.toISOString()
    }
  }
}
