import { Tenant } from '../entities/tenant.entity.js'

export interface TenantRepository {
  save(tenant: Tenant): Promise<void>
  findById(id: string): Promise<Tenant | null>
  delete(id: string): Promise<void>
  softDelete(id: string): Promise<void>
}
