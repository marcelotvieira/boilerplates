import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository.interface.js'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository.interface.js'
import { PasswordHasher } from '../../../infrastructure/adapters/bcrypt-password-hasher.js'
import { User } from '../../users/entities/user.entity.js'
import { BadRequestException, NotFoundException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { isCodeExpired } from '../../../shared/utils/verification-code.utils.js'

export interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
}

export interface ResetPasswordOutput {
  success: boolean
  message: string
}

@injectable()
export class ResetPasswordUseCase {
  private readonly logger = Logger.of('ResetPasswordUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordResetTokenRepository) private passwordResetTokenRepository: PasswordResetTokenRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    this.logger.info('Password reset attempt', { email: input.email })

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      this.logger.warn('Password reset failed: user not found', { email: input.email })
      throw new NotFoundException('User not found')
    }

    // Find reset token
    const resetToken = await this.passwordResetTokenRepository.findByEmailAndCode(input.email, input.code)
    if (!resetToken) {
      this.logger.warn('Password reset failed: invalid code', { email: input.email })
      throw new BadRequestException('Invalid or expired reset code')
    }

    // Check if token has been used
    if (resetToken.used) {
      this.logger.warn('Password reset failed: code already used', { email: input.email })
      throw new BadRequestException('This reset code has already been used')
    }

    // Check if token is expired
    if (isCodeExpired(resetToken.expiresAt)) {
      this.logger.warn('Password reset failed: code expired', { email: input.email })
      throw new BadRequestException('Reset code has expired. Please request a new one.')
    }

    // Hash new password
    const newPasswordHash = await this.passwordHasher.hash(input.newPassword)

    // Update user password
    const updatedUser = new User({
      ...user,
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    })

    await this.userRepository.save(updatedUser)

    // Mark reset token as used
    await this.passwordResetTokenRepository.markAsUsed(input.email, input.code)

    // Revoke all existing refresh tokens for security
    // User must login again with new password
    await this.refreshTokenRepository.revokeAllByUserId(user.id)

    this.logger.info('Password reset successful', {
      userId: user.id,
      email: user.email
    })

    return {
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.'
    }
  }
}
