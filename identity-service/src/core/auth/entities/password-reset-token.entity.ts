export interface PasswordResetTokenProps {
  email: string
  code: string
  expiresAt: Date
  used?: boolean
  resendCount?: number
  lastResendAt?: Date
  createdAt?: Date
}

export class PasswordResetToken {
  public readonly email: string
  public readonly code: string
  public readonly expiresAt: Date
  public readonly used: boolean
  public readonly resendCount: number
  public readonly lastResendAt?: Date
  public readonly createdAt: Date

  constructor(props: PasswordResetTokenProps) {
    this.email = props.email.toLowerCase().trim()
    this.code = props.code
    this.expiresAt = props.expiresAt
    this.used = props.used ?? false
    this.resendCount = props.resendCount ?? 0
    this.lastResendAt = props.lastResendAt
    this.createdAt = props.createdAt ?? new Date()
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  public isValid(): boolean {
    return !this.used && !this.isExpired()
  }

  public canResend(): boolean {
    if (this.resendCount >= 5) {
      return false
    }

    if (!this.lastResendAt) {
      return true
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    return this.lastResendAt < oneMinuteAgo
  }
}
