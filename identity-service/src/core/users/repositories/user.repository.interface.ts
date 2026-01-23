import { User } from '../entities/user.entity.js'

export interface UserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByTenantId(tenantId: string): Promise<User[]>
  delete(id: string): Promise<void>
  softDelete(id: string): Promise<void>
}
