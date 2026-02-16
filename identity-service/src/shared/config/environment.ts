/**
 * Environment Configuration
 * Centralizes all environment variables with type safety
 */

export interface Config {
  // Environment
  NODE_ENV: string
  IS_LOCAL: boolean
  IS_OFFLINE: boolean

  // AWS
  AWS_REGION: string
  DYNAMODB_ENDPOINT?: string
  EVENTBRIDGE_ENDPOINT?: string

  // DynamoDB
  DYNAMODB_TABLE_NAME: string

  // EventBridge
  IDENTITY_EVENT_BUS_NAME: string

  // JWT
  JWT_SECRET: string
  JWT_ACCESS_EXPIRATION: string
  JWT_REFRESH_EXPIRATION: string

  // Security
  BCRYPT_ROUNDS: number

  // Verification Codes
  EMAIL_VERIFICATION_CODE_LENGTH: number
  EMAIL_VERIFICATION_EXPIRATION_MINUTES: number
  PASSWORD_RESET_CODE_LENGTH: number
  PASSWORD_RESET_EXPIRATION_MINUTES: number

  // Invites
  INVITE_EXPIRATION_DAYS: number

  // Rate Limiting
  MAX_VERIFICATION_RESENDS: number
  VERIFICATION_RESEND_COOLDOWN_MINUTES: number
  MAX_PASSWORD_RESET_RESENDS: number
  PASSWORD_RESET_RESEND_COOLDOWN_MINUTES: number

  // Frontend URLs
  FRONTEND_URL: string
  INVITE_ACCEPT_PATH: string

  // Inter-service communication
  BILLING_SERVICE_URL: string
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value
}

function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

function getEnvVarAsBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

export const config: Config = {
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_LOCAL: getEnvVar('NODE_ENV', 'development') === 'local',
  IS_OFFLINE: getEnvVarAsBoolean('IS_OFFLINE', false),

  // AWS
  AWS_REGION: getEnvVar('AWS_REGION', 'us-east-1'),
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
  EVENTBRIDGE_ENDPOINT: process.env.EVENTBRIDGE_ENDPOINT,

  // DynamoDB
  DYNAMODB_TABLE_NAME: getEnvVar('DYNAMODB_TABLE_NAME'),

  // EventBridge
  IDENTITY_EVENT_BUS_NAME: getEnvVar('IDENTITY_EVENT_BUS_NAME'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_ACCESS_EXPIRATION: getEnvVar('JWT_ACCESS_EXPIRATION', '30m'),
  JWT_REFRESH_EXPIRATION: getEnvVar('JWT_REFRESH_EXPIRATION', '7d'),

  // Security
  BCRYPT_ROUNDS: getEnvVarAsNumber('BCRYPT_ROUNDS', 10),

  // Verification Codes
  EMAIL_VERIFICATION_CODE_LENGTH: getEnvVarAsNumber('EMAIL_VERIFICATION_CODE_LENGTH', 6),
  EMAIL_VERIFICATION_EXPIRATION_MINUTES: getEnvVarAsNumber('EMAIL_VERIFICATION_EXPIRATION_MINUTES', 15),
  PASSWORD_RESET_CODE_LENGTH: getEnvVarAsNumber('PASSWORD_RESET_CODE_LENGTH', 6),
  PASSWORD_RESET_EXPIRATION_MINUTES: getEnvVarAsNumber('PASSWORD_RESET_EXPIRATION_MINUTES', 15),

  // Invites
  INVITE_EXPIRATION_DAYS: getEnvVarAsNumber('INVITE_EXPIRATION_DAYS', 7),

  // Rate Limiting
  MAX_VERIFICATION_RESENDS: getEnvVarAsNumber('MAX_VERIFICATION_RESENDS', 3),
  VERIFICATION_RESEND_COOLDOWN_MINUTES: getEnvVarAsNumber('VERIFICATION_RESEND_COOLDOWN_MINUTES', 2),
  MAX_PASSWORD_RESET_RESENDS: getEnvVarAsNumber('MAX_PASSWORD_RESET_RESENDS', 3),
  PASSWORD_RESET_RESEND_COOLDOWN_MINUTES: getEnvVarAsNumber('PASSWORD_RESET_RESEND_COOLDOWN_MINUTES', 2),

  // Frontend URLs
  FRONTEND_URL: getEnvVar('FRONTEND_URL'),
  INVITE_ACCEPT_PATH: getEnvVar('INVITE_ACCEPT_PATH', '/auth/accept-invite'),

  // Inter-service communication
  BILLING_SERVICE_URL: getEnvVar('BILLING_SERVICE_URL', 'http://localhost:3004'),
}
