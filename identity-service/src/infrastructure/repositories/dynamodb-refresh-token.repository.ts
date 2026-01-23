import { injectable } from 'inversify'
import { RefreshTokenRepository } from '../../core/auth/repositories/refresh-token.repository.interface.js'
import { RefreshToken } from '../../core/auth/entities/refresh-token.entity.js'
import { RefreshTokenModel, RefreshTokenDocument } from '../database/models/refresh-token.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBRefreshTokenRepository implements RefreshTokenRepository {
  private readonly logger = Logger.of('DynamoDBRefreshTokenRepository')

  async save(token: RefreshToken): Promise<void> {
    this.logger.info('Saving refresh token', {
      id: token.id,
      userId: token.userId
    })

    try {
      const keys = KeyBuilder.buildRefreshTokenKeys(token.tokenHash)
      const userGSI = KeyBuilder.buildRefreshTokenUserGSI(token.userId, token.tokenHash)

      const tokenDocument: Partial<RefreshTokenDocument> = {
        ...keys,
        ...userGSI,
        entityType: EntityType.REFRESH_TOKEN,
        id: token.id,
        tokenHash: token.tokenHash,
        userId: token.userId,
        expiresAt: token.expiresAt,
        revoked: token.revoked,
        revokedAt: token.revokedAt
      }

      const existingToken = await this.findByTokenHash(token.tokenHash)

      if (existingToken) {
        this.logger.info('Refresh token exists, updating', { id: token.id })
        await RefreshTokenModel.update(keys, {
          revoked: token.revoked,
          revokedAt: token.revokedAt
        })
      } else {
        this.logger.info('New refresh token, creating', { id: token.id })
        await RefreshTokenModel.create(tokenDocument)
      }

      this.logger.info('Refresh token saved successfully', { id: token.id })

    } catch (error: any) {
      this.logger.error('Error saving refresh token', error, {
        id: token.id
      })
      throw error
    }
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    this.logger.info('Finding refresh token by hash')

    try {
      const keys = KeyBuilder.buildRefreshTokenKeys(tokenHash)
      const tokenDoc = await RefreshTokenModel.get(keys)

      if (!tokenDoc) {
        this.logger.info('Refresh token not found')
        return null
      }

      const token = this.mapDocumentToEntity(tokenDoc as unknown as RefreshTokenDocument)
      this.logger.info('Refresh token found', { id: token.id })
      return token

    } catch (error: any) {
      this.logger.error('Error finding refresh token by hash', error)
      throw error
    }
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    this.logger.info('Finding refresh tokens by user', { userId })

    try {
      const tokenDocs = await RefreshTokenModel.query('GSI1PK')
        .eq(`USER#${userId}#TOKENS`)
        .using('GSI1')
        .exec()

      const tokens = tokenDocs.map(doc => this.mapDocumentToEntity(doc as unknown as RefreshTokenDocument))
      this.logger.info('Refresh tokens found by user', {
        userId,
        count: tokens.length
      })

      return tokens

    } catch (error: any) {
      this.logger.error('Error finding refresh tokens by user', error, {
        userId
      })
      throw error
    }
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    this.logger.info('Revoking refresh token')

    try {
      const keys = KeyBuilder.buildRefreshTokenKeys(tokenHash)
      const now = new Date()

      await RefreshTokenModel.update(keys, {
        revoked: true,
        revokedAt: now,
        updatedAt: now
      })

      this.logger.info('Refresh token revoked successfully')

    } catch (error: any) {
      this.logger.error('Error revoking refresh token', error)
      throw error
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    this.logger.info('Revoking all refresh tokens for user', { userId })

    try {
      const tokens = await this.findByUserId(userId)
      const now = new Date()

      const updatePromises = tokens.map(token =>
        RefreshTokenModel.update(
          KeyBuilder.buildRefreshTokenKeys(token.tokenHash),
          { revoked: true, revokedAt: now }
        )
      )

      await Promise.allSettled(updatePromises)
      this.logger.info('All refresh tokens revoked', {
        userId,
        count: tokens.length
      })

    } catch (error: any) {
      this.logger.error('Error revoking all refresh tokens', error, { userId })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting refresh token', { id })

    try {
      // Note: We don't have direct access to tokenHash from id
      // This would need to be refactored if direct deletion by id is needed
      throw new Error('Delete by id not supported. Use revokeByTokenHash instead.')

    } catch (error: any) {
      this.logger.error('Error deleting refresh token', error, { id })
      throw error
    }
  }

  private mapDocumentToEntity(doc: RefreshTokenDocument): RefreshToken {
    return new RefreshToken({
      id: doc.id,
      tokenHash: doc.tokenHash,
      userId: doc.userId,
      expiresAt: doc.expiresAt,
      revoked: doc.revoked,
      revokedAt: doc.revokedAt,
      createdAt: doc.createdAt
    })
  }
}
