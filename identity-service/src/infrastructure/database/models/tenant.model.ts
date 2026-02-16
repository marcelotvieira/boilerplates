import dynamoose from 'dynamoose'
import { TenantStatus } from '../../../core/tenants/enums/tenant-status.enum.js'
import { PlanSlug } from '../../../core/tenants/enums/plan-slug.enum.js'
import {
  createExtendedSchema,
  EntityType,
  getTableName,
  BaseDocument,
  baseModelOptions
} from '../base.schema.js'

// Interface para tipagem do documento
export interface TenantDocument extends BaseDocument {
  name: string
  ownerId: string
  planSlug: PlanSlug
  status: TenantStatus
  deletedAt?: Date
}

// Schema do Tenant usando o base schema
const tenantSchema = createExtendedSchema(EntityType.TENANT, {
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  planSlug: {
    type: String,
    enum: Object.values(PlanSlug),
    default: PlanSlug.FREE
  },
  status: {
    type: String,
    enum: Object.values(TenantStatus),
    default: TenantStatus.ACTIVE
  },
  deletedAt: { type: Date, required: false }
})

// Model tipado
export const TenantModel = dynamoose.model('Tenant', tenantSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
