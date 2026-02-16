import { UserTenantMembership } from '../entities/user-tenant-membership.entity.js'

export interface UserTenantMembershipRepository {
  save(membership: UserTenantMembership): Promise<void>
  findByUserAndTenant(userId: string, tenantId: string): Promise<UserTenantMembership | null>
  findByUserId(userId: string): Promise<UserTenantMembership[]>
  findByTenantId(tenantId: string): Promise<UserTenantMembership[]>
  countByTenantId(tenantId: string): Promise<number>
  remove(userId: string, tenantId: string): Promise<void>
  setDefault(userId: string, tenantId: string): Promise<void>
}
