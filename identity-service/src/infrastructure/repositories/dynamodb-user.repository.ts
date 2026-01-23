import { injectable } from 'inversify'
import { UserRepository } from '../../core/users/repositories/user.repository.interface.js'
import { User } from '../../core/users/entities/user.entity.js'
import { UserModel, UserDocument } from '../database/models/user.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBUserRepository implements UserRepository {
  private readonly logger = Logger.of('DynamoDBUserRepository')

  async save(user: User): Promise<void> {
    this.logger.info('Saving user', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId
    })

    try {
      // Build keys para Single Table Design
      const keys = KeyBuilder.buildUserKeys(user.id)
      const emailGSI = KeyBuilder.buildEmailGSI(user.email, user.id)
      const tenantGSI = KeyBuilder.buildTenantUsersGSI(user.tenantId, user.id)

      const userDocument: Partial<UserDocument> = {
        // Single Table Design keys
        ...keys,
        ...emailGSI,
        ...tenantGSI,
        entityType: EntityType.USER,

        // User data
        id: user.id,
        tenantId: user.tenantId,
        fullName: user.fullName,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        emailVerified: user.emailVerified,
        emailVerificationCode: user.emailVerificationCode,
        emailVerificationExpiresAt: user.emailVerificationExpiresAt,
        deletedAt: user.deletedAt
      }

      // Check if user exists to decide between create or update
      const existingUser = await this.findById(user.id)

      if (existingUser) {
        // User exists - use update to modify existing record
        this.logger.info('User exists, updating', { userId: user.id })
        await UserModel.update(keys, {
          fullName: user.fullName,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          emailVerified: user.emailVerified,
          emailVerificationCode: user.emailVerificationCode,
          emailVerificationExpiresAt: user.emailVerificationExpiresAt,
          deletedAt: user.deletedAt,
          ...emailGSI,
          ...tenantGSI
        })
      } else {
        // New user - use create to prevent duplicates
        this.logger.info('New user, creating', { userId: user.id })
        await UserModel.create(userDocument)
      }

      this.logger.info('User saved successfully', { userId: user.id })

    } catch (error: any) {
      this.logger.error('Error saving user', error, {
        userId: user.id
      })
      throw error
    }
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info('Finding user by ID', { userId: id })

    try {
      const keys = KeyBuilder.buildUserKeys(id)
      const userDoc = await UserModel.get(keys)

      if (!userDoc) {
        this.logger.info('User not found', { userId: id })
        return null
      }

      const user = this.mapDocumentToEntity(userDoc as unknown as UserDocument)
      this.logger.info('User found', { userId: id, email: user.email })
      return user

    } catch (error: any) {
      this.logger.error('Error finding user by ID', error, {
        userId: id
      })
      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.info('Finding user by email', { email })

    try {
      const users = await UserModel.query('GSI1PK')
        .eq(`EMAIL#${email}`)
        .using('GSI1')
        .exec()

      if (!users.length) {
        this.logger.info('User not found by email', { email })
        return null
      }

      const user = this.mapDocumentToEntity(users[0] as unknown as UserDocument)
      this.logger.info('User found by email', { email, userId: user.id })
      return user

    } catch (error: any) {
      this.logger.error('Error finding user by email', error, {
        email
      })
      throw error
    }
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    this.logger.info('Finding users by tenant', { tenantId })

    try {
      const userDocs = await UserModel.query('GSI2PK')
        .eq(`TENANT#${tenantId}#USERS`)
        .using('GSI2')
        .exec()

      const users = userDocs.map(doc => this.mapDocumentToEntity(doc as unknown as UserDocument))
      this.logger.info('Users found by tenant', {
        tenantId,
        count: users.length
      })

      return users

    } catch (error: any) {
      this.logger.error('Error finding users by tenant', error, {
        tenantId
      })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting user', { userId: id })

    try {
      const keys = KeyBuilder.buildUserKeys(id)
      await UserModel.delete(keys)
      this.logger.info('User deleted successfully', { userId: id })

    } catch (error: any) {
      this.logger.error('Error deleting user', error, {
        userId: id
      })
      throw error
    }
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info('Soft deleting user', { userId: id })

    try {
      const keys = KeyBuilder.buildUserKeys(id)
      const now = new Date()

      await UserModel.update(keys, {
        deletedAt: now,
        updatedAt: now
      })

      this.logger.info('User soft deleted successfully', { userId: id })

    } catch (error: any) {
      this.logger.error('Error soft deleting user', error, { userId: id })
      throw error
    }
  }

  private mapDocumentToEntity(doc: UserDocument): User {
    return new User({
      id: doc.id,
      fullName: doc.fullName,
      email: doc.email,
      tenantId: doc.tenantId,
      passwordHash: doc.passwordHash,
      role: doc.role,
      emailVerified: doc.emailVerified,
      emailVerificationCode: doc.emailVerificationCode,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })
  }
}
