import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.interface.js'
import { UnauthorizedException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { JwtUtils } from '../../../shared/utils/jwt.utils.js'

export interface LogoutInput {
  refreshToken: string
}

export interface LogoutOutput {
  success: boolean
  message: string
}

@injectable()
export class LogoutUseCase {
  private readonly logger = Logger.of('LogoutUseCase')

  constructor(
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    this.logger.info('Processing logout')

    // Verify refresh token format
    try {
      JwtUtils.verifyRefreshToken(input.refreshToken)
    } catch (error: any) {
      this.logger.warn('Invalid refresh token format during logout', { error: error.message })
      throw new UnauthorizedException('Invalid refresh token')
    }

    // Hash the token to find it in database
    const tokenHash = JwtUtils.hashToken(input.refreshToken)

    // Find and revoke refresh token
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash)
    if (!storedToken) {
      this.logger.warn('Refresh token not found during logout')
      // Don't fail - token might have been already revoked or expired
      return {
        success: true,
        message: 'Logged out successfully'
      }
    }

    // Revoke the token
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash)

    this.logger.info('Logout successful', {
      tokenId: storedToken.id,
      userId: storedToken.userId
    })

    return {
      success: true,
      message: 'Logged out successfully'
    }
  }
}
