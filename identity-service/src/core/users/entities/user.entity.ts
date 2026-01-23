import { UserRole } from '../enums/user-role.enum.js'

export interface UserProps {
  id: string
  fullName: string
  email: string
  tenantId: string
  passwordHash: string
  role?: UserRole
  emailVerified?: boolean
  emailVerificationCode?: string
  emailVerificationExpiresAt?: Date
  deletedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class User {
  public readonly id: string
  public readonly fullName: string
  public readonly email: string
  public readonly tenantId: string
  public readonly passwordHash: string
  public readonly role: UserRole
  public readonly emailVerified: boolean
  public readonly emailVerificationCode?: string
  public readonly emailVerificationExpiresAt?: Date
  public readonly deletedAt?: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserProps) {
    this.id = props.id
    this.fullName = props.fullName
    this.email = props.email.toLowerCase().trim()
    this.tenantId = props.tenantId
    this.passwordHash = props.passwordHash
    this.role = props.role ?? UserRole.OWNER
    this.emailVerified = props.emailVerified ?? false
    this.emailVerificationCode = props.emailVerificationCode
    this.emailVerificationExpiresAt = props.emailVerificationExpiresAt
    this.deletedAt = props.deletedAt
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }
}
