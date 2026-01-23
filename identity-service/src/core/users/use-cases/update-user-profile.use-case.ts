import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../repositories/user.repository.interface.js'
import { User } from '../entities/user.entity.js'
import { NotFoundException, ConflictException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'

export interface UpdateUserProfileInput {
  userId: string
  fullName?: string
  email?: string
}

export interface UpdateUserProfileOutput {
  id: string
  email: string
  fullName: string
  role: string
  emailVerified: boolean
  updatedAt: string
}

@injectable()
export class UpdateUserProfileUseCase {
  private readonly logger = Logger.of('UpdateUserProfileUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
    this.logger.info('Updating user profile', { userId: input.userId })

    // Find user
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      this.logger.warn('User not found', { userId: input.userId })
      throw new NotFoundException('User not found')
    }

    // Check if email is being changed
    if (input.email && input.email !== user.email) {
      // Check if new email is already in use
      const existingUser = await this.userRepository.findByEmail(input.email)
      if (existingUser) {
        this.logger.warn('Email already in use', {
          userId: input.userId,
          newEmail: input.email,
          existingUserId: existingUser.id
        })
        throw new ConflictException('Email is already in use by another user')
      }
    }

    // Update user
    const updatedUser = new User({
      ...user,
      fullName: input.fullName ?? user.fullName,
      email: input.email ?? user.email,
      // If email changed, mark as unverified and clear verification code
      emailVerified: input.email && input.email !== user.email ? false : user.emailVerified,
      emailVerificationCode: input.email && input.email !== user.email ? undefined : user.emailVerificationCode,
      emailVerificationExpiresAt: input.email && input.email !== user.email ? undefined : user.emailVerificationExpiresAt,
      updatedAt: new Date()
    })

    await this.userRepository.save(updatedUser)

    this.logger.info('User profile updated', {
      userId: user.id,
      emailChanged: input.email && input.email !== user.email
    })

    // If email was changed, user will need to verify new email
    if (input.email && input.email !== user.email) {
      this.logger.info('Email changed - verification required', {
        userId: user.id,
        oldEmail: user.email,
        newEmail: input.email
      })
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      updatedAt: updatedUser.updatedAt.toISOString()
    }
  }
}
