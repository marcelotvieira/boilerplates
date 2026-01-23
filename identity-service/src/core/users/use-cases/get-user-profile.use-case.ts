import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { NotFoundException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface GetUserProfileInput {
  userId: string
}

export interface GetUserProfileOutput {
  id: string
  email: string
  fullName: string
  role: string
  emailVerified: boolean
  tenant: {
    id: string
    name: string
    status: string
  }
  createdAt: string
  updatedAt: string
}

@injectable()
export class GetUserProfileUseCase {
  private readonly logger = Logger.of('GetUserProfileUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository
  ) {}

  async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    this.logger.info('Getting user profile', { userId: input.userId })

    // Find user
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      this.logger.warn('User not found', { userId: input.userId })
      throw new NotFoundException('User not found')
    }

    // Find tenant
    const tenant = await this.tenantRepository.findById(user.tenantId)
    if (!tenant) {
      this.logger.error('Tenant not found for user', new Error('Tenant not found'), {
        userId: user.id,
        tenantId: user.tenantId
      })
      throw new NotFoundException('Tenant not found')
    }

    this.logger.info('User profile retrieved', { userId: user.id })

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerified: user.emailVerified,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }
}
