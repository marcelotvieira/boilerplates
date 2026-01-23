import { UserRole } from '../../users/enums/user-role.enum.js'
import { InviteStatus } from '../enums/invite-status.enum.js'

export interface InviteProps {
  token: string
  tenantId: string
  email: string
  role: UserRole
  status?: InviteStatus
  expiresAt: Date
  createdBy: string
  acceptedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Invite {
  public readonly token: string
  public readonly tenantId: string
  public readonly email: string
  public readonly role: UserRole
  public readonly status: InviteStatus
  public readonly expiresAt: Date
  public readonly createdBy: string
  public readonly acceptedAt?: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: InviteProps) {
    this.token = props.token
    this.tenantId = props.tenantId
    this.email = props.email.toLowerCase().trim()
    this.role = props.role
    this.status = props.status ?? InviteStatus.PENDING
    this.expiresAt = props.expiresAt
    this.createdBy = props.createdBy
    this.acceptedAt = props.acceptedAt
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  public isPending(): boolean {
    return this.status === InviteStatus.PENDING && !this.isExpired()
  }
}
