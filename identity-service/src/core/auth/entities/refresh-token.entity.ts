export interface RefreshTokenProps {
  id: string
  tokenHash: string
  userId: string
  expiresAt: Date
  revoked?: boolean
  revokedAt?: Date
  createdAt?: Date
}

export class RefreshToken {
  public readonly id: string
  public readonly tokenHash: string
  public readonly userId: string
  public readonly expiresAt: Date
  public readonly revoked: boolean
  public readonly revokedAt?: Date
  public readonly createdAt: Date

  constructor(props: RefreshTokenProps) {
    this.id = props.id
    this.tokenHash = props.tokenHash
    this.userId = props.userId
    this.expiresAt = props.expiresAt
    this.revoked = props.revoked ?? false
    this.revokedAt = props.revokedAt
    this.createdAt = props.createdAt ?? new Date()
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  public isValid(): boolean {
    return !this.revoked && !this.isExpired()
  }
}
