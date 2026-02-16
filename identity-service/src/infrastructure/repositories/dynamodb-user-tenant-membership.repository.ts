import { injectable } from 'inversify'
import { UserTenantMembershipRepository } from '../../core/memberships/repositories/user-tenant-membership.repository.interface.js'
import { UserTenantMembership } from '../../core/memberships/entities/user-tenant-membership.entity.js'
import { UserTenantMembershipModel, UserTenantMembershipDocument } from '../database/models/user-tenant-membership.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBUserTenantMembershipRepository implements UserTenantMembershipRepository {
  private readonly logger = Logger.of('DynamoDBUserTenantMembershipRepository')

  async save(membership: UserTenantMembership): Promise<void> {
    this.logger.info('Saving membership', {
      userId: membership.userId,
      tenantId: membership.tenantId,
      role: membership.role
    })

    try {
      const keys = KeyBuilder.buildMembershipKeys(membership.userId, membership.tenantId)
      const userGSI = KeyBuilder.buildMembershipUserGSI(membership.userId, membership.tenantId)
      const tenantGSI = KeyBuilder.buildMembershipTenantGSI(membership.tenantId, membership.userId)

      const document: Partial<UserTenantMembershipDocument> = {
        ...keys,
        ...userGSI,
        ...tenantGSI,
        entityType: EntityType.USER_TENANT_MEMBERSHIP,
        id: `${membership.userId}#${membership.tenantId}`,
        userId: membership.userId,
        tenantId: membership.tenantId,
        role: membership.role,
        isDefault: membership.isDefault,
        joinedAt: membership.joinedAt,
        leftAt: membership.leftAt
      }

      const existing = await this.findByUserAndTenant(membership.userId, membership.tenantId)

      if (existing) {
        this.logger.info('Membership exists, updating', {
          userId: membership.userId,
          tenantId: membership.tenantId
        })
        await UserTenantMembershipModel.update(keys, {
          role: membership.role,
          isDefault: membership.isDefault,
          leftAt: membership.leftAt,
          ...userGSI,
          ...tenantGSI
        })
      } else {
        this.logger.info('New membership, creating', {
          userId: membership.userId,
          tenantId: membership.tenantId
        })
        await UserTenantMembershipModel.create(document)
      }

      this.logger.info('Membership saved successfully', {
        userId: membership.userId,
        tenantId: membership.tenantId
      })

    } catch (error: any) {
      this.logger.error('Error saving membership', error, {
        userId: membership.userId,
        tenantId: membership.tenantId
      })
      throw error
    }
  }

  async findByUserAndTenant(userId: string, tenantId: string): Promise<UserTenantMembership | null> {
    this.logger.info('Finding membership by user and tenant', { userId, tenantId })

    try {
      const keys = KeyBuilder.buildMembershipKeys(userId, tenantId)
      const doc = await UserTenantMembershipModel.get(keys)

      if (!doc) {
        this.logger.info('Membership not found', { userId, tenantId })
        return null
      }

      const membership = this.mapDocumentToEntity(doc as unknown as UserTenantMembershipDocument)
      this.logger.info('Membership found', { userId, tenantId, role: membership.role })
      return membership

    } catch (error: any) {
      this.logger.error('Error finding membership', error, { userId, tenantId })
      throw error
    }
  }

  async findByUserId(userId: string): Promise<UserTenantMembership[]> {
    this.logger.info('Finding memberships by user', { userId })

    try {
      const docs = await UserTenantMembershipModel.query('GSI1PK')
        .eq(`USER#${userId}#TENANTS`)
        .using('GSI1')
        .exec()

      const memberships = docs
        .map(doc => this.mapDocumentToEntity(doc as unknown as UserTenantMembershipDocument))
        .filter(m => m.isActive())

      this.logger.info('Memberships found by user', {
        userId,
        count: memberships.length
      })

      return memberships

    } catch (error: any) {
      this.logger.error('Error finding memberships by user', error, { userId })
      throw error
    }
  }

  async findByTenantId(tenantId: string): Promise<UserTenantMembership[]> {
    this.logger.info('Finding memberships by tenant', { tenantId })

    try {
      const docs = await UserTenantMembershipModel.query('GSI2PK')
        .eq(`TENANT#${tenantId}#MEMBERS`)
        .using('GSI2')
        .exec()

      const memberships = docs
        .map(doc => this.mapDocumentToEntity(doc as unknown as UserTenantMembershipDocument))
        .filter(m => m.isActive())

      this.logger.info('Memberships found by tenant', {
        tenantId,
        count: memberships.length
      })

      return memberships

    } catch (error: any) {
      this.logger.error('Error finding memberships by tenant', error, { tenantId })
      throw error
    }
  }

  async countByTenantId(tenantId: string): Promise<number> {
    this.logger.info('Counting memberships by tenant', { tenantId })

    try {
      const result = await UserTenantMembershipModel.query('GSI2PK')
        .eq(`TENANT#${tenantId}#MEMBERS`)
        .using('GSI2')
        .count()
        .exec()

      this.logger.info('Memberships counted', {
        tenantId,
        count: result
      })

      const count = typeof result === 'object' && result !== null && 'count' in result
        ? (result as any).count
        : result
      return count as number

    } catch (error: any) {
      this.logger.error('Error counting memberships by tenant', error, { tenantId })
      throw error
    }
  }

  async remove(userId: string, tenantId: string): Promise<void> {
    this.logger.info('Removing membership (soft delete)', { userId, tenantId })

    try {
      const keys = KeyBuilder.buildMembershipKeys(userId, tenantId)

      await UserTenantMembershipModel.update(keys, {
        leftAt: new Date()
      })

      this.logger.info('Membership removed successfully', { userId, tenantId })

    } catch (error: any) {
      this.logger.error('Error removing membership', error, { userId, tenantId })
      throw error
    }
  }

  async setDefault(userId: string, tenantId: string): Promise<void> {
    this.logger.info('Setting default membership', { userId, tenantId })

    try {
      // First, unset all current defaults for this user
      const memberships = await this.findByUserId(userId)

      for (const membership of memberships) {
        if (membership.isDefault && membership.tenantId !== tenantId) {
          const keys = KeyBuilder.buildMembershipKeys(userId, membership.tenantId)
          await UserTenantMembershipModel.update(keys, {
            isDefault: false
          })
        }
      }

      // Set the new default
      const keys = KeyBuilder.buildMembershipKeys(userId, tenantId)
      await UserTenantMembershipModel.update(keys, {
        isDefault: true
      })

      this.logger.info('Default membership set successfully', { userId, tenantId })

    } catch (error: any) {
      this.logger.error('Error setting default membership', error, { userId, tenantId })
      throw error
    }
  }

  private mapDocumentToEntity(doc: UserTenantMembershipDocument): UserTenantMembership {
    return new UserTenantMembership({
      userId: doc.userId,
      tenantId: doc.tenantId,
      role: doc.role,
      isDefault: doc.isDefault,
      joinedAt: doc.joinedAt,
      leftAt: doc.leftAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })
  }
}
