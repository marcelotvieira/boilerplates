import dynamoose from 'dynamoose'
import { UserRole } from '../../../core/users/enums/user-role.enum.js'
import {
  createExtendedSchema,
  EntityType,
  getTableName,
  BaseDocument,
  baseModelOptions
} from '../base.schema.js'

// Interface para tipagem do documento
export interface UserTenantMembershipDocument extends BaseDocument {
  userId: string
  tenantId: string
  role: UserRole
  isDefault: boolean
  joinedAt: Date
  leftAt?: Date
}

// Schema do UserTenantMembership usando o base schema
const userTenantMembershipSchema = createExtendedSchema(EntityType.USER_TENANT_MEMBERSHIP, {
  userId: { type: String, required: true },
  tenantId: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  isDefault: { type: Boolean, default: false },
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date, required: false }
})

// Model tipado
export const UserTenantMembershipModel = dynamoose.model('UserTenantMembership', userTenantMembershipSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
