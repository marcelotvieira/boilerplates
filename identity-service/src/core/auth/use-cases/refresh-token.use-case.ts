import { inject, injectable } from 'inversify'
import { randomUUID } from 'crypto'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.interface.js'
import { RefreshToken } from '../entities/refresh-token.entity.js'
import { UnauthorizedException, ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { JwtUtils, TokenPair } from '../../../shared/utils/jwt.utils.js'
import { TenantStatus } from '../../tenants/enums/tenant-status.enum.js'

export interface RefreshTokenInput {
  refreshToken: string
}

export interface RefreshTokenOutput {
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
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

@injectable()
export class RefreshTokenUseCase {
  private readonly logger = Logger.of('RefreshTokenUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    this.logger.info('Refreshing access token')

    // Verify refresh token
    let payload: { userId: string; tenantId: string }
    try {
      payload = JwtUtils.verifyRefreshToken(input.refreshToken)
    } catch (error: any) {
      this.logger.warn('Invalid refresh token', { error: error.message })
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    // Hash the token to find it in database
    const tokenHash = JwtUtils.hashToken(input.refreshToken)

    // Find refresh token in database
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash)
    if (!storedToken) {
      this.logger.warn('Refresh token not found in database', { userId: payload.userId })
      throw new UnauthorizedException('Invalid refresh token')
    }

    // Check if token is revoked
    if (storedToken.revoked) {
      this.logger.warn('Attempt to use revoked refresh token', {
        userId: payload.userId,
        tokenId: storedToken.id
      })
      throw new UnauthorizedException('Refresh token has been revoked')
    }

    // Check if token is expired
    if (storedToken.isExpired()) {
      this.logger.warn('Refresh token expired', {
        userId: payload.userId,
        tokenId: storedToken.id
      })
      throw new UnauthorizedException('Refresh token has expired')
    }

    // Get user
    const user = await this.userRepository.findById(payload.userId)
    if (!user) {
      this.logger.error('User not found for valid token', new Error('User not found'), {
        userId: payload.userId
      })
      throw new UnauthorizedException('Invalid token')
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      this.logger.warn('Token refresh denied: email not verified', {
        userId: user.id,
        email: user.email
      })
      throw new ForbiddenException('Email not verified')
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
      this.logger.warn('Token refresh denied: tenant not active', {
        userId: user.id,
        tenantId: tenant.id,
        tenantStatus: tenant.status
      })
      throw new ForbiddenException('Account is not active')
    }

    // Revoke old refresh token (token rotation)
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash)

    // Generate new token pair
    const tokenPair: TokenPair = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    })

    // Save new refresh token
    const newRefreshToken = new RefreshToken({
      id: randomUUID(),
      tokenHash: tokenPair.refreshTokenHash,
      userId: user.id,
      expiresAt: tokenPair.refreshTokenExpiresAt,
      revoked: false,
      createdAt: new Date()
    })

    await this.refreshTokenRepository.save(newRefreshToken)

    this.logger.info('Token refreshed successfully', {
      userId: user.id,
      oldTokenId: storedToken.id,
      newTokenId: newRefreshToken.id
    })

    return JwtUtils.createAuthResponse(user, tenant, tokenPair)
  }
}
