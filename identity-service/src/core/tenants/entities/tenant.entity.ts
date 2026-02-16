import { TenantStatus } from '../enums/tenant-status.enum.js'
import { PlanSlug } from '../enums/plan-slug.enum.js'

export interface TenantProps {
  id: string
  name: string
  ownerId: string
  planSlug?: PlanSlug
  status?: TenantStatus
  deletedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Tenant {
  public readonly id: string
  public readonly name: string
  public readonly ownerId: string
  public readonly planSlug: PlanSlug
  public readonly status: TenantStatus
  public readonly deletedAt?: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: TenantProps) {
    this.id = props.id
    this.name = props.name
    this.ownerId = props.ownerId
    this.planSlug = props.planSlug ?? PlanSlug.FREE
    this.status = props.status ?? TenantStatus.ACTIVE
    this.deletedAt = props.deletedAt
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }
}
