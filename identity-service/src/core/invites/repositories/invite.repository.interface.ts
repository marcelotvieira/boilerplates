import { Invite } from '../entities/invite.entity.js'

export interface InviteRepository {
  save(invite: Invite): Promise<void>
  findByToken(token: string): Promise<Invite | null>
  findByTenantId(tenantId: string): Promise<Invite[]>
  findByEmailAndTenant(email: string, tenantId: string): Promise<Invite | null>
  delete(token: string): Promise<void>
}
