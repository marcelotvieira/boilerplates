/**
 * Dependency Injection Types
 * Defines symbols for Inversify container bindings
 */

export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  TenantRepository: Symbol.for('TenantRepository'),
  InviteRepository: Symbol.for('InviteRepository'),
  RefreshTokenRepository: Symbol.for('RefreshTokenRepository'),
  PasswordResetTokenRepository: Symbol.for('PasswordResetTokenRepository'),
  UserTenantMembershipRepository: Symbol.for('UserTenantMembershipRepository'),

  // Services
  PasswordHasher: Symbol.for('PasswordHasher'),
  EventBusService: Symbol.for('EventBusService'),
  BillingServiceClient: Symbol.for('BillingServiceClient'),

  // Use Cases - Auth
  RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
  LoginUseCase: Symbol.for('LoginUseCase'),
  RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
  LogoutUseCase: Symbol.for('LogoutUseCase'),
  VerifyEmailUseCase: Symbol.for('VerifyEmailUseCase'),
  ResendVerificationCodeUseCase: Symbol.for('ResendVerificationCodeUseCase'),
  RequestPasswordResetUseCase: Symbol.for('RequestPasswordResetUseCase'),
  ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),

  // Use Cases - Users
  GetUserProfileUseCase: Symbol.for('GetUserProfileUseCase'),
  UpdateUserProfileUseCase: Symbol.for('UpdateUserProfileUseCase'),
  ChangePasswordUseCase: Symbol.for('ChangePasswordUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),

  // Use Cases - Tenants
  GetTenantUseCase: Symbol.for('GetTenantUseCase'),
  UpdateTenantUseCase: Symbol.for('UpdateTenantUseCase'),
  GetTenantMembersUseCase: Symbol.for('GetTenantMembersUseCase'),

  // Use Cases - Invites
  CreateInviteUseCase: Symbol.for('CreateInviteUseCase'),
  AcceptInviteUseCase: Symbol.for('AcceptInviteUseCase'),
  ListTenantInvitesUseCase: Symbol.for('ListTenantInvitesUseCase'),
  CancelInviteUseCase: Symbol.for('CancelInviteUseCase'),
  ResendInviteUseCase: Symbol.for('ResendInviteUseCase'),

  // Use Cases - Memberships
  ListUserTenantsUseCase: Symbol.for('ListUserTenantsUseCase')
}
