import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { TenantRepository } from '../repositories/tenant.repository.interface.js'
import { NotFoundException, ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface GetTenantInput {
  tenantId: string
  requestingUserTenantId: string
}

export interface GetTenantOutput {
  id: string
  name: string
  ownerId: string
  status: string
  createdAt: string
  updatedAt: string
}

@injectable()
export class GetTenantUseCase {
  private readonly logger = Logger.of('GetTenantUseCase')

  constructor(
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository
  ) {}

  async execute(input: GetTenantInput): Promise<GetTenantOutput> {
    this.logger.info('Getting tenant', { tenantId: input.tenantId })

    // Authorization: User can only view their own tenant
    if (input.tenantId !== input.requestingUserTenantId) {
      this.logger.warn('Unauthorized tenant access attempt', {
        requestedTenantId: input.tenantId,
        userTenantId: input.requestingUserTenantId
      })
      throw new ForbiddenException('You can only view your own organization')
    }

    // Find tenant
    const tenant = await this.tenantRepository.findById(input.tenantId)
    if (!tenant) {
      this.logger.warn('Tenant not found', { tenantId: input.tenantId })
      throw new NotFoundException('Organization not found')
    }

    this.logger.info('Tenant retrieved', { tenantId: tenant.id })

    return {
      id: tenant.id,
      name: tenant.name,
      ownerId: tenant.ownerId,
      status: tenant.status,
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString()
    }
  }
}
