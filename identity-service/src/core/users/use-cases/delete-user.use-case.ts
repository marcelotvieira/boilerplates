import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../repositories/user.repository.interface.js'
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository.interface.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { NotFoundException, ForbiddenException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { UserRole } from '../enums/user-role.enum.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, UserDeletedEvent } from '../../../shared/events/event-types.js'

export interface DeleteUserInput {
  userId: string
  requestingUserId: string
  requestingUserRole: string
}

export interface DeleteUserOutput {
  success: boolean
  message: string
}

@injectable()
export class DeleteUserUseCase {
  private readonly logger = Logger.of('DeleteUserUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    this.logger.info('Deleting user', {
      userId: input.userId,
      requestingUserId: input.requestingUserId
    })

    // Find user to delete
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      this.logger.warn('User not found', { userId: input.userId })
      throw new NotFoundException('User not found')
    }

    // Authorization checks
    // Users can delete themselves
    // OWNERs and ADMINs can delete MEMBERs
    // Only OWNERs can delete ADMINs
    // OWNERs cannot be deleted unless they are deleting themselves

    const isSelfDelete = input.userId === input.requestingUserId

    if (!isSelfDelete) {
      // Trying to delete another user
      if (user.role === UserRole.OWNER) {
        this.logger.warn('Attempt to delete OWNER by another user', {
          userId: input.userId,
          requestingUserId: input.requestingUserId
        })
        throw new ForbiddenException('Cannot delete account owner')
      }

      if (user.role === UserRole.ADMIN && input.requestingUserRole !== UserRole.OWNER) {
        this.logger.warn('Attempt to delete ADMIN by non-OWNER', {
          userId: input.userId,
          requestingUserId: input.requestingUserId,
          requestingUserRole: input.requestingUserRole
        })
        throw new ForbiddenException('Only account owners can delete administrators')
      }

      if (user.role === UserRole.MEMBER &&
          input.requestingUserRole !== UserRole.OWNER &&
          input.requestingUserRole !== UserRole.ADMIN) {
        this.logger.warn('Attempt to delete MEMBER by non-privileged user', {
          userId: input.userId,
          requestingUserId: input.requestingUserId,
          requestingUserRole: input.requestingUserRole
        })
        throw new ForbiddenException('Insufficient permissions to delete user')
      }
    }

    // Soft delete the user
    await this.userRepository.softDelete(user.id)

    // Revoke all refresh tokens
    await this.refreshTokenRepository.revokeAllByUserId(user.id)

    this.logger.info('User deleted successfully', {
      userId: user.id,
      email: user.email,
      isSelfDelete
    })

    // Publish UserDeleted event
    await this.publishUserDeletedEvent(user.id, user.email, user.tenantId)

    return {
      success: true,
      message: isSelfDelete
        ? 'Your account has been deleted successfully'
        : 'User has been deleted successfully'
    }
  }

  private async publishUserDeletedEvent(userId: string, email: string, tenantId: string): Promise<void> {
    try {
      const event: UserDeletedEvent = {
        eventId: randomUUID(),
        eventTime: new Date().toISOString(),
        source: EVENT_SOURCE,
        version: EVENT_VERSION,
        eventType: 'UserDeleted',
        data: {
          userId,
          email,
          tenantId,
          deletionType: 'soft_delete'
        }
      }

      await this.eventBus.publish(event)

      this.logger.info('UserDeleted event published', { userId, tenantId })
    } catch (error: any) {
      this.logger.error('Failed to publish UserDeleted event', error, { userId })
      // Don't fail the deletion if event publishing fails
    }
  }
}
