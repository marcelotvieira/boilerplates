import { injectable } from 'inversify'
import { TenantRepository } from '../../core/tenants/repositories/tenant.repository.interface.js'
import { Tenant } from '../../core/tenants/entities/tenant.entity.js'
import { TenantModel, TenantDocument } from '../database/models/tenant.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBTenantRepository implements TenantRepository {
  private readonly logger = Logger.of('DynamoDBTenantRepository')

  async save(tenant: Tenant): Promise<void> {
    this.logger.info('Saving tenant', {
      tenantId: tenant.id,
      name: tenant.name
    })

    try {
      const keys = KeyBuilder.buildTenantKeys(tenant.id)

      const tenantDocument: Partial<TenantDocument> = {
        ...keys,
        entityType: EntityType.TENANT,
        id: tenant.id,
        name: tenant.name,
        ownerId: tenant.ownerId,
        planSlug: tenant.planSlug,
        status: tenant.status,
        deletedAt: tenant.deletedAt
      }

      const existingTenant = await this.findById(tenant.id)

      if (existingTenant) {
        this.logger.info('Tenant exists, updating', { tenantId: tenant.id })
        await TenantModel.update(keys, {
          name: tenant.name,
          ownerId: tenant.ownerId,
          planSlug: tenant.planSlug,
          status: tenant.status,
          deletedAt: tenant.deletedAt
        })
      } else {
        this.logger.info('New tenant, creating', { tenantId: tenant.id })
        await TenantModel.create(tenantDocument)
      }

      this.logger.info('Tenant saved successfully', { tenantId: tenant.id })

    } catch (error: any) {
      this.logger.error('Error saving tenant', error, {
        tenantId: tenant.id
      })
      throw error
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    this.logger.info('Finding tenant by ID', { tenantId: id })

    try {
      const keys = KeyBuilder.buildTenantKeys(id)
      const tenantDoc = await TenantModel.get(keys)

      if (!tenantDoc) {
        this.logger.info('Tenant not found', { tenantId: id })
        return null
      }

      const tenant = this.mapDocumentToEntity(tenantDoc as unknown as TenantDocument)
      this.logger.info('Tenant found', { tenantId: id, name: tenant.name })
      return tenant

    } catch (error: any) {
      this.logger.error('Error finding tenant by ID', error, {
        tenantId: id
      })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting tenant', { tenantId: id })

    try {
      const keys = KeyBuilder.buildTenantKeys(id)
      await TenantModel.delete(keys)
      this.logger.info('Tenant deleted successfully', { tenantId: id })

    } catch (error: any) {
      this.logger.error('Error deleting tenant', error, {
        tenantId: id
      })
      throw error
    }
  }

  async softDelete(id: string): Promise<void> {
    this.logger.info('Soft deleting tenant', { tenantId: id })

    try {
      const keys = KeyBuilder.buildTenantKeys(id)
      const now = new Date()

      await TenantModel.update(keys, {
        deletedAt: now,
        updatedAt: now
      })

      this.logger.info('Tenant soft deleted successfully', { tenantId: id })

    } catch (error: any) {
      this.logger.error('Error soft deleting tenant', error, { tenantId: id })
      throw error
    }
  }

  private mapDocumentToEntity(doc: TenantDocument): Tenant {
    return new Tenant({
      id: doc.id,
      name: doc.name,
      ownerId: doc.ownerId,
      planSlug: doc.planSlug,
      status: doc.status,
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })
  }
}
