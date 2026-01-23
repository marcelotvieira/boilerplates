import dynamoose from 'dynamoose'
import {
  createExtendedSchema,
  EntityType,
  getTableName,
  BaseDocument,
  baseModelOptions
} from '../base.schema.js'

// Interface para tipagem do documento
export interface RefreshTokenDocument extends BaseDocument {
  tokenHash: string
  userId: string
  expiresAt: Date
  revoked: boolean
  revokedAt?: Date
}

// Schema do RefreshToken usando o base schema
const refreshTokenSchema = createExtendedSchema(EntityType.REFRESH_TOKEN, {
  tokenHash: { type: String, required: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  revokedAt: { type: Date, required: false }
})

// Model tipado
export const RefreshTokenModel = dynamoose.model('RefreshToken', refreshTokenSchema, {
  tableName: getTableName(),
  ...baseModelOptions
})
