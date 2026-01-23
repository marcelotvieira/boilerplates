import dynamoose from 'dynamoose'
import { UserRole } from '../../../core/users/enums/user-role.enum.js'
import { InviteStatus } from '../../../core/invites/enums/invite-status.enum.js'
import {
  createExtendedSchema,
  EntityType,
  getTableName,
  BaseDocument,
  baseModelOptions
} from '../base.schema.js'

// Interface para tipagem do documento
export interface InviteDocument extends BaseDocument {
  token: string
  tenantId: string
  email: string
  role: UserRole
  status: InviteStatus
  expiresAt: Date
  createdBy: string
  acceptedAt?: Date
}

// Schema do Invite usando o base schema
const inviteSchema = createExtendedSchema(EntityType.INVITE, {
  token: { type: String, required: true },
  tenantId: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(InviteStatus),
    default: InviteStatus.PENDING
  },
  expiresAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  acceptedAt: { type: Date, required: false }
})

// Model tipado
export const InviteModel = dynamoose.model('Invite', inviteSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
