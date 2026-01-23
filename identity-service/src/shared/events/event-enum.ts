/**
 * Event patterns following AWS EventBridge best practices
 * Source: identity-service
 * DetailType: resource.action (kebab-case)
 */

export enum IdentityEventType {
  // Email events
  EMAIL_VERIFICATION_REQUESTED = 'email-verification.requested',
  PASSWORD_RESET_REQUESTED = 'password-reset.requested',
  INVITE_CREATED = 'invite.created',

  // User events
  USER_REGISTERED = 'user.registered',
  USER_EMAIL_VERIFIED = 'user.email-verified',
  USER_DELETED = 'user.deleted',

  // Tenant events
  TENANT_CREATED = 'tenant.created'
}

export enum IdentityEventSource {
  IDENTITY_SERVICE = 'identity-service'
}

export const IDENTITY_EVENT_VERSION = '1.0'
