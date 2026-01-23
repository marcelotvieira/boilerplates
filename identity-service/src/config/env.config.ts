export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  STAGE: process.env.STAGE || 'local',

  // AWS
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',

  // DynamoDB
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || 'identity-service-local',
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',

  // EventBridge
  IDENTITY_EVENT_BUS_NAME: process.env.IDENTITY_EVENT_BUS_NAME || 'identity-service-local',
  EVENTBRIDGE_ENDPOINT: process.env.EVENTBRIDGE_ENDPOINT || 'http://localhost:4566',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production',
  JWT_ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m',
  JWT_REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',

  // Password
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Verification codes
  EMAIL_VERIFICATION_CODE_EXPIRATION_MINUTES: parseInt(process.env.EMAIL_VERIFICATION_CODE_EXPIRATION_MINUTES || '15', 10),
  PASSWORD_RESET_CODE_EXPIRATION_MINUTES: parseInt(process.env.PASSWORD_RESET_CODE_EXPIRATION_MINUTES || '15', 10),

  // Invites
  INVITE_EXPIRATION_DAYS: parseInt(process.env.INVITE_EXPIRATION_DAYS || '7', 10),
  INVITE_LINK_BASE_URL: process.env.INVITE_LINK_BASE_URL || 'http://localhost:3000/signup',

  // LocalStack
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  IS_LOCAL: process.env.IS_LOCAL === 'true' || process.env.STAGE === 'local',
}

export type Config = typeof config
