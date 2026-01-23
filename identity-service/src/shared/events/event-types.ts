/**
 * Event Types for EventBridge
 * Defines the contract for events published by identity-service
 */

export interface BaseEvent {
  eventId: string
  eventTime: string
  source: string
  version: string
}

// Email Service Events

export interface EmailVerificationRequestedEvent extends BaseEvent {
  eventType: 'EmailVerificationRequested'
  data: {
    email: string
    fullName: string
    verificationCode: string
    expiresAt: string
    template: 'email-verification'
    templateData: {
      userName: string
      code: string
      expiresInMinutes: number
    }
  }
}

export interface PasswordResetRequestedEvent extends BaseEvent {
  eventType: 'PasswordResetRequested'
  data: {
    email: string
    fullName: string
    resetCode: string
    expiresAt: string
    template: 'password-reset'
    templateData: {
      userName: string
      code: string
      expiresInMinutes: number
    }
  }
}

export interface InviteCreatedEvent extends BaseEvent {
  eventType: 'InviteCreated'
  data: {
    inviteToken: string
    email: string
    tenantId: string
    tenantName: string
    role: string
    invitedBy: string
    inviteLink: string
    expiresAt: string
    template: 'invite'
    templateData: {
      recipientEmail: string
      tenantName: string
      invitedByName: string
      role: string
      inviteLink: string
      expiresInDays: number
    }
  }
}

// User Events

export interface UserRegisteredEvent extends BaseEvent {
  eventType: 'UserRegistered'
  data: {
    userId: string
    email: string
    fullName: string
    tenantId: string
    role: string
    registrationType: 'direct' | 'invite'
    inviteToken?: string
  }
}

export interface UserEmailVerifiedEvent extends BaseEvent {
  eventType: 'UserEmailVerified'
  data: {
    userId: string
    email: string
    fullName: string
    tenantId: string
    tenantName: string
    role: 'OWNER'
  }
}

export interface UserDeletedEvent extends BaseEvent {
  eventType: 'UserDeleted'
  data: {
    userId: string
    email: string
    tenantId: string
    deletionType: 'soft_delete'
  }
}

// Tenant Events

export interface TenantCreatedEvent extends BaseEvent {
  eventType: 'TenantCreated'
  data: {
    tenantId: string
    name: string
    ownerId: string
    ownerEmail: string
  }
}

export type DomainEvent =
  | EmailVerificationRequestedEvent
  | PasswordResetRequestedEvent
  | InviteCreatedEvent
  | UserRegisteredEvent
  | UserEmailVerifiedEvent
  | UserDeletedEvent
  | TenantCreatedEvent

export const EVENT_SOURCE = 'identity-service'
export const EVENT_VERSION = '1.0'
