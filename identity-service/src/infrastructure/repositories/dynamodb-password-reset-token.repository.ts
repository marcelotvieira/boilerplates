import { injectable } from 'inversify'
import { PasswordResetTokenRepository } from '../../core/auth/repositories/password-reset-token.repository.interface.js'
import { PasswordResetToken } from '../../core/auth/entities/password-reset-token.entity.js'
import { PasswordResetTokenModel, PasswordResetTokenDocument } from '../database/models/password-reset-token.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private readonly logger = Logger.of('DynamoDBPasswordResetTokenRepository')

  async save(token: PasswordResetToken): Promise<void> {
    this.logger.info('Saving password reset token', {
      email: token.email
    })

    try {
      const keys = KeyBuilder.buildPasswordResetTokenKeys(token.email, token.code)

      const tokenDocument: Partial<PasswordResetTokenDocument> = {
        ...keys,
        entityType: EntityType.PASSWORD_RESET_TOKEN,
        id: `${token.email}#${token.code}`,
        email: token.email,
        code: token.code,
        expiresAt: token.expiresAt,
        used: token.used,
        resendCount: token.resendCount,
        lastResendAt: token.lastResendAt
      }

      const existingToken = await this.findByEmailAndCode(token.email, token.code)

      if (existingToken) {
        this.logger.info('Password reset token exists, updating', { email: token.email })
        await PasswordResetTokenModel.update(keys, {
          used: token.used,
          resendCount: token.resendCount,
          lastResendAt: token.lastResendAt
        })
      } else {
        this.logger.info('New password reset token, creating', { email: token.email })
        await PasswordResetTokenModel.create(tokenDocument)
      }

      this.logger.info('Password reset token saved successfully', { email: token.email })

    } catch (error: any) {
      this.logger.error('Error saving password reset token', error, {
        email: token.email
      })
      throw error
    }
  }

  async findByEmailAndCode(email: string, code: string): Promise<PasswordResetToken | null> {
    this.logger.info('Finding password reset token', { email })

    try {
      const keys = KeyBuilder.buildPasswordResetTokenKeys(email, code)
      const tokenDoc = await PasswordResetTokenModel.get(keys)

      if (!tokenDoc) {
        this.logger.info('Password reset token not found', { email })
        return null
      }

      const token = this.mapDocumentToEntity(tokenDoc as unknown as PasswordResetTokenDocument)
      this.logger.info('Password reset token found', { email })
      return token

    } catch (error: any) {
      this.logger.error('Error finding password reset token', error, {
        email
      })
      throw error
    }
  }

  async findByEmail(email: string): Promise<PasswordResetToken[]> {
    this.logger.info('Finding all password reset tokens by email', { email })

    try {
      const tokenDocs = await PasswordResetTokenModel.query('PK')
        .eq(`PASSWORD_RESET#${email}`)
        .exec()

      const tokens = tokenDocs.map(doc => this.mapDocumentToEntity(doc as unknown as PasswordResetTokenDocument))
      this.logger.info('Password reset tokens found', {
        email,
        count: tokens.length
      })

      return tokens

    } catch (error: any) {
      this.logger.error('Error finding password reset tokens by email', error, {
        email
      })
      throw error
    }
  }

  async markAsUsed(email: string, code: string): Promise<void> {
    this.logger.info('Marking password reset token as used', { email })

    try {
      const keys = KeyBuilder.buildPasswordResetTokenKeys(email, code)

      // Note: updatedAt is automatically managed by Dynamoose (timestamps: true in base schema)
      await PasswordResetTokenModel.update(keys, {
        used: true
      })

      this.logger.info('Password reset token marked as used', { email })

    } catch (error: any) {
      this.logger.error('Error marking password reset token as used', error, {
        email
      })
      throw error
    }
  }

  async delete(email: string, code: string): Promise<void> {
    this.logger.info('Deleting password reset token', { email })

    try {
      const keys = KeyBuilder.buildPasswordResetTokenKeys(email, code)
      await PasswordResetTokenModel.delete(keys)
      this.logger.info('Password reset token deleted successfully', { email })

    } catch (error: any) {
      this.logger.error('Error deleting password reset token', error, {
        email
      })
      throw error
    }
  }

  async deleteByEmail(email: string): Promise<void> {
    this.logger.info('Deleting all password reset tokens for email', { email })

    try {
      const tokens = await this.findByEmail(email)

      const deletePromises = tokens.map(token =>
        this.delete(token.email, token.code)
      )

      await Promise.allSettled(deletePromises)
      this.logger.info('All password reset tokens deleted', {
        email,
        count: tokens.length
      })

    } catch (error: any) {
      this.logger.error('Error deleting all password reset tokens', error, {
        email
      })
      throw error
    }
  }

  private mapDocumentToEntity(doc: PasswordResetTokenDocument): PasswordResetToken {
    return new PasswordResetToken({
      email: doc.email,
      code: doc.code,
      expiresAt: doc.expiresAt,
      used: doc.used,
      resendCount: doc.resendCount,
      lastResendAt: doc.lastResendAt,
      createdAt: doc.createdAt
    })
  }
}
