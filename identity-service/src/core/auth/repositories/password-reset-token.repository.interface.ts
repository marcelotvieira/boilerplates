import { PasswordResetToken } from '../entities/password-reset-token.entity.js'

export interface PasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>
  findByEmailAndCode(email: string, code: string): Promise<PasswordResetToken | null>
  findByEmail(email: string): Promise<PasswordResetToken[]>
  markAsUsed(email: string, code: string): Promise<void>
  delete(email: string, code: string): Promise<void>
  deleteByEmail(email: string): Promise<void>
}
