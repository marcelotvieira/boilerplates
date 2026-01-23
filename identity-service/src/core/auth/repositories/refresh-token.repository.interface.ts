import { RefreshToken } from '../entities/refresh-token.entity.js'

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>
  findByUserId(userId: string): Promise<RefreshToken[]>
  revokeByTokenHash(tokenHash: string): Promise<void>
  revokeAllByUserId(userId: string): Promise<void>
  delete(id: string): Promise<void>
}
