import dynamoose from 'dynamoose'
import {
  createExtendedSchema,
  EntityType,
  getTableName,
  BaseDocument,
  baseModelOptions
} from '../base.schema.js'

// Interface para tipagem do documento
export interface PasswordResetTokenDocument extends BaseDocument {
  email: string
  code: string
  expiresAt: Date
  used: boolean
  resendCount: number
  lastResendAt?: Date
}

// Schema do PasswordResetToken usando o base schema
const passwordResetTokenSchema = createExtendedSchema(EntityType.PASSWORD_RESET_TOKEN, {
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  resendCount: { type: Number, default: 0 },
  lastResendAt: { type: Date, required: false }
})

// Model tipado
export const PasswordResetTokenModel = dynamoose.model('PasswordResetToken', passwordResetTokenSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
