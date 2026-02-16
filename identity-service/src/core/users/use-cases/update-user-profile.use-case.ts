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

    // Email cannot be changed after registration
    if (input.email && input.email !== user.email) {
      this.logger.warn('Email change attempt rejected', {
        userId: input.userId,
        currentEmail: user.email,
        attemptedEmail: input.email
      })
      throw new ConflictException('Email cannot be changed after registration')
    }

    // Update user (only fullName can be updated)
    const updatedUser = new User({
      ...user,
      fullName: input.fullName ?? user.fullName,
      updatedAt: new Date()
    })

    await this.userRepository.save(updatedUser)

    this.logger.info('User profile updated', {
      userId: user.id
    })

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
