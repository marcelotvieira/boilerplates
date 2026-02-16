import { UserRole } from '../../users/enums/user-role.enum.js'

export interface UserTenantMembershipProps {
  userId: string
  tenantId: string
  role: UserRole
  isDefault: boolean
  joinedAt: Date
  leftAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class UserTenantMembership {
  public readonly userId: string
  public readonly tenantId: string
  public readonly role: UserRole
  public readonly isDefault: boolean
  public readonly joinedAt: Date
  public readonly leftAt?: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserTenantMembershipProps) {
    this.userId = props.userId
    this.tenantId = props.tenantId
    this.role = props.role
    this.isDefault = props.isDefault ?? false
    this.joinedAt = props.joinedAt
    this.leftAt = props.leftAt
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  isActive(): boolean {
    return !this.leftAt
  }
}
