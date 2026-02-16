import dynamoose from 'dynamoose'
import { SchemaDefinition } from 'dynamoose/dist/Schema'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../../config/env.config.js'

// Entity types para Single Table Design
export enum EntityType {
  USER = 'USER',
  TENANT = 'TENANT',
  INVITE = 'INVITE',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN',
  USER_TENANT_MEMBERSHIP = 'USER_TENANT_MEMBERSHIP'
}

// Base schema definition para Single Table Design
export const getBaseSchemaDefinition = (entityType: EntityType) => ({
  // Single Table Design Keys
  PK: {
    type: String,
    hashKey: true
  },
  SK: {
    type: String,
    rangeKey: true
  },

  // Global Secondary Indexes
  GSI1PK: {
    type: String,
    index: { name: 'GSI1', rangeKey: 'GSI1SK' }
  },
  GSI1SK: String,
  GSI2PK: {
    type: String,
    index: { name: 'GSI2', rangeKey: 'GSI2SK' }
  },
  GSI2SK: String,

  // Entity metadata
  entityType: { type: String, default: entityType, required: true },
  id: { type: String, required: true, default: () => uuidv4() },
  tenantId: { type: String, required: false }
})

// Schema options
export const baseSchemaOptions = {
  timestamps: true, // Auto createdAt/updatedAt
  saveUnknown: false
}

// Model options - prevent table creation
export const baseModelOptions = {
  create: false,
  update: false,
  waitForActive: false
}

// Base interface para Single Table Design
export interface BaseDocument {
  // Single Table Design fields
  PK: string
  SK: string
  GSI1PK?: string
  GSI1SK?: string
  GSI2PK?: string
  GSI2SK?: string
  entityType: EntityType

  // Base fields
  id: string
  tenantId?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Get table name helper
export function getTableName(): string {
  return config.DYNAMODB_TABLE_NAME
}

/**
 * Access Patterns para Single Table Design
 *
 * 1. Get User by ID → PK: USER#{userId}, SK: PROFILE
 * 2. Get User by Email → GSI1: EMAIL#{email}
 * 3. List Users by Tenant → GSI2: TENANT#{tenantId}#USERS
 * 4. Get Tenant by ID → PK: TENANT#{tenantId}, SK: METADATA
 * 5. Get Invite by Token → PK: INVITE#{token}, SK: METADATA
 * 6. List Invites by Tenant → GSI2: TENANT#{tenantId}#INVITES
 * 7. Get Password Reset Token → PK: PASSWORD_RESET#{email}, SK: CODE#{code}
 * 8. Get Refresh Token → PK: REFRESH_TOKEN#{hash}, SK: METADATA
 * 9. List Refresh Tokens by User → GSI1: USER#{userId}#TOKENS
 * 10. Get Membership by User+Tenant → PK: MEMBERSHIP#{userId}, SK: TENANT#{tenantId}
 * 11. List Tenants by User → GSI1: USER#{userId}#TENANTS
 * 12. List Members by Tenant → GSI2: TENANT#{tenantId}#MEMBERS
 */

export class KeyBuilder {
  // === USERS ===
  // PK: USER#{userId}, SK: PROFILE
  static buildUserKeys(userId: string) {
    return {
      PK: `USER#${userId}`,
      SK: `PROFILE`
    }
  }

  // === TENANTS ===
  // PK: TENANT#{tenantId}, SK: METADATA
  static buildTenantKeys(tenantId: string) {
    return {
      PK: `TENANT#${tenantId}`,
      SK: `METADATA`
    }
  }

  // === INVITES ===
  // PK: INVITE#{token}, SK: METADATA
  static buildInviteKeys(token: string) {
    return {
      PK: `INVITE#${token}`,
      SK: `METADATA`
    }
  }

  // === REFRESH TOKENS ===
  // PK: REFRESH_TOKEN#{tokenHash}, SK: METADATA
  static buildRefreshTokenKeys(tokenHash: string) {
    return {
      PK: `REFRESH_TOKEN#${tokenHash}`,
      SK: `METADATA`
    }
  }

  // === PASSWORD RESET TOKENS ===
  // PK: PASSWORD_RESET#{email}, SK: CODE#{code}
  static buildPasswordResetTokenKeys(email: string, code: string) {
    return {
      PK: `PASSWORD_RESET#${email}`,
      SK: `CODE#${code}`
    }
  }

  // === GSI1: Email and Token Lookup ===

  // GSI1: Email único global
  // GSI1PK: EMAIL#{email}, GSI1SK: USER#{userId}
  static buildEmailGSI(email: string, userId: string) {
    return {
      GSI1PK: `EMAIL#${email}`,
      GSI1SK: `USER#${userId}`
    }
  }

  // GSI1: Invite by Email and Tenant
  // GSI1PK: INVITE#EMAIL#{email}, GSI1SK: TENANT#{tenantId}
  static buildInviteEmailGSI(email: string, tenantId: string) {
    return {
      GSI1PK: `INVITE#EMAIL#${email}`,
      GSI1SK: `TENANT#${tenantId}`
    }
  }

  // GSI1: Refresh Tokens by User
  // GSI1PK: USER#{userId}#TOKENS, GSI1SK: TOKEN#{tokenHash}
  static buildRefreshTokenUserGSI(userId: string, tokenHash: string) {
    return {
      GSI1PK: `USER#${userId}#TOKENS`,
      GSI1SK: `TOKEN#${tokenHash}`
    }
  }

  // === GSI2: Tenant Collections ===

  // GSI2: Users por Tenant
  // GSI2PK: TENANT#{tenantId}#USERS, GSI2SK: USER#{userId}
  static buildTenantUsersGSI(tenantId: string, userId: string) {
    return {
      GSI2PK: `TENANT#${tenantId}#USERS`,
      GSI2SK: `USER#${userId}`
    }
  }

  // GSI2: Invites por Tenant
  // GSI2PK: TENANT#{tenantId}#INVITES, GSI2SK: INVITE#{token}
  static buildTenantInvitesGSI(tenantId: string, inviteToken: string) {
    return {
      GSI2PK: `TENANT#${tenantId}#INVITES`,
      GSI2SK: `INVITE#${inviteToken}`
    }
  }

  // === USER TENANT MEMBERSHIPS ===

  // PK: MEMBERSHIP#{userId}, SK: TENANT#{tenantId}
  static buildMembershipKeys(userId: string, tenantId: string) {
    return {
      PK: `MEMBERSHIP#${userId}`,
      SK: `TENANT#${tenantId}`
    }
  }

  // GSI1: Buscar todos os tenants de um usuário
  // GSI1PK: USER#{userId}#TENANTS, GSI1SK: TENANT#{tenantId}
  static buildMembershipUserGSI(userId: string, tenantId: string) {
    return {
      GSI1PK: `USER#${userId}#TENANTS`,
      GSI1SK: `TENANT#${tenantId}`
    }
  }

  // GSI2: Buscar todos os membros de um tenant
  // GSI2PK: TENANT#{tenantId}#MEMBERS, GSI2SK: USER#{userId}
  static buildMembershipTenantGSI(tenantId: string, userId: string) {
    return {
      GSI2PK: `TENANT#${tenantId}#MEMBERS`,
      GSI2SK: `USER#${userId}`
    }
  }
}

// Function to create extended schema
export const createExtendedSchema = (entityType: EntityType, customFields: SchemaDefinition = {}) => {
  const schemaDefinition = {
    ...getBaseSchemaDefinition(entityType),
    ...customFields
  }

  return new dynamoose.Schema(schemaDefinition, baseSchemaOptions)
}
