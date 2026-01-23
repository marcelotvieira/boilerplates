import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../repositories/user.repository.interface.js'
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository.interface.js'
import { PasswordHasher } from '../../../infrastructure/adapters/bcrypt-password-hasher.js'
import { User } from '../entities/user.entity.js'
import { NotFoundException, UnauthorizedException, BadRequestException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordOutput {
  success: boolean
  message: string
}

@injectable()
export class ChangePasswordUseCase {
  private readonly logger = Logger.of('ChangePasswordUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher
  ) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
    this.logger.info('Changing password', { userId: input.userId })

    // Find user
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      this.logger.warn('User not found', { userId: input.userId })
      throw new NotFoundException('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      input.currentPassword,
      user.passwordHash
    )

    if (!isCurrentPasswordValid) {
      this.logger.warn('Invalid current password', { userId: input.userId })
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Ensure new password is different from current password
    const isSamePassword = await this.passwordHasher.compare(
      input.newPassword,
      user.passwordHash
    )

    if (isSamePassword) {
      this.logger.warn('New password same as current password', { userId: input.userId })
      throw new BadRequestException('New password must be different from current password')
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

    // Revoke all existing refresh tokens for security
    // User must login again with new password on other devices
    await this.refreshTokenRepository.revokeAllByUserId(user.id)

    this.logger.info('Password changed successfully', { userId: user.id })

    return {
      success: true,
      message: 'Password changed successfully. You have been logged out from other devices.'
    }
  }
}
