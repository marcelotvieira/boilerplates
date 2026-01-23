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
export interface UserDocument extends BaseDocument {
  // User specific fields
  tenantId: string // Override para tornar obrigatório no User
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
  emailVerified: boolean
  emailVerificationCode?: string
  emailVerificationExpiresAt?: Date
  deletedAt?: Date
}

// Schema do User usando o base schema
const userSchema = createExtendedSchema(EntityType.USER, {
  tenantId: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.OWNER
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, required: false },
  emailVerificationExpiresAt: { type: Date, required: false },
  deletedAt: { type: Date, required: false }
})

// Model tipado
export const UserModel = dynamoose.model('User', userSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
