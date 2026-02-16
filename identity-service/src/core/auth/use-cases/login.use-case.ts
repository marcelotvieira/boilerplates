import { inject, injectable } from 'inversify'
import { randomUUID } from 'crypto'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.interface.js'
import { UserTenantMembershipRepository } from '../../memberships/repositories/user-tenant-membership.repository.interface.js'
import { PasswordHasher } from '../../../infrastructure/adapters/bcrypt-password-hasher.js'
import { RefreshToken } from '../entities/refresh-token.entity.js'
import { UnauthorizedException, ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { JwtUtils, TokenPair } from '../../../shared/utils/jwt.utils.js'
import { TenantStatus } from '../../tenants/enums/tenant-status.enum.js'
import { UserRole } from '../../users/enums/user-role.enum.js'
import { BillingServiceClient } from '../../../infrastructure/adapters/billing-service.client.js'

export interface LoginInput {
  email: string
  password: string
}

export interface TenantMembership {
  id: string
  name: string
  role: UserRole
  isDefault: boolean
  planSlug: string
}

export interface LoginOutput {
  user: {
    id: string
    email: string
    fullName: string
    role: string
    emailVerified: boolean
  }
  tenant: {
    id: string
    name: string
    status: string
    planSlug: string
  }
  tenants: TenantMembership[]
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

@injectable()
export class LoginUseCase {
  private readonly logger = Logger.of('LoginUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository,
    @inject(TYPES.UserTenantMembershipRepository) private membershipRepository: UserTenantMembershipRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
    @inject(TYPES.BillingServiceClient) private billingClient: BillingServiceClient
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    this.logger.info('Login attempt', { email: input.email })

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      this.logger.warn('Login failed: user not found', { email: input.email })
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash)
    if (!isPasswordValid) {
      this.logger.warn('Login failed: invalid password', { email: input.email, userId: user.id })
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      this.logger.warn('Login failed: email not verified', { email: input.email, userId: user.id })
      throw new ForbiddenException('Email not verified. Please verify your email before logging in.')
    }

    // Get tenant
    const tenant = await this.tenantRepository.findById(user.tenantId)
    if (!tenant) {
      this.logger.error('Tenant not found for user', new Error('Tenant not found'), {
        userId: user.id,
        tenantId: user.tenantId
      })
      throw new UnauthorizedException('Invalid account state')
    }

    // Check if tenant is active
    if (tenant.status !== TenantStatus.ACTIVE) {
      this.logger.warn('Login failed: tenant not active', {
        userId: user.id,
        tenantId: tenant.id,
        tenantStatus: tenant.status
      })
      throw new ForbiddenException('Your account is not active. Please contact support.')
    }

    // Check if tenant is deleted
    if (tenant.deletedAt) {
      this.logger.warn('Login failed: tenant deleted', {
        userId: user.id,
        tenantId: tenant.id
      })
      throw new ForbiddenException('Your account has been deleted.')
    }

    // Resolve plan slug
    const plan = tenant.planSlug?.toUpperCase() || 'FREE'

    // Generate initial token pair (needed for billing-service auth)
    const initialTokenPair: TokenPair = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      plan
    })

    // Fetch entitlements from billing-service
    const planEntitlements = await this.billingClient.getPlanEntitlements(
      plan,
      initialTokenPair.accessToken
    )
    const entitlements = planEntitlements.entitlements

    // Regenerate tokens with entitlements included
    const tokenPair: TokenPair = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      plan,
      entitlements
    })

    // Save refresh token to database
    const refreshToken = new RefreshToken({
      id: randomUUID(),
      tokenHash: tokenPair.refreshTokenHash,
      userId: user.id,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      revoked: false,
      createdAt: new Date()
    })

    await this.refreshTokenRepository.save(refreshToken)

    // Fetch user's tenant memberships
    const memberships = await this.membershipRepository.findByUserId(user.id)
    const tenantsWithDetails = await Promise.all(
      memberships.map(async (membership) => {
        const memberTenant = await this.tenantRepository.findById(membership.tenantId)
        return {
          id: membership.tenantId,
          name: memberTenant?.name || 'Unknown',
          role: membership.role,
          isDefault: membership.isDefault,
          planSlug: memberTenant?.planSlug || 'FREE'
        }
      })
    )

    this.logger.info('Login successful', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      tenantsCount: tenantsWithDetails.length
    })

    const authResponse = JwtUtils.createAuthResponse(user, tenant, tokenPair, entitlements)
    return {
      ...authResponse,
      tenants: tenantsWithDetails
    }
  }
}
