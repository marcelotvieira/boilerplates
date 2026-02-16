import 'reflect-metadata'
import { Container } from 'inversify'
import { TYPES } from './types.js'

// Repositories
import { UserRepository } from '../../core/users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../core/tenants/repositories/tenant.repository.interface.js'
import { InviteRepository } from '../../core/invites/repositories/invite.repository.interface.js'
import { RefreshTokenRepository } from '../../core/auth/repositories/refresh-token.repository.interface.js'
import { PasswordResetTokenRepository } from '../../core/auth/repositories/password-reset-token.repository.interface.js'
import { UserTenantMembershipRepository } from '../../core/memberships/repositories/user-tenant-membership.repository.interface.js'

import { DynamoDBUserRepository } from '../../infrastructure/repositories/dynamodb-user.repository.js'
import { DynamoDBTenantRepository } from '../../infrastructure/repositories/dynamodb-tenant.repository.js'
import { DynamoDBInviteRepository } from '../../infrastructure/repositories/dynamodb-invite.repository.js'
import { DynamoDBRefreshTokenRepository } from '../../infrastructure/repositories/dynamodb-refresh-token.repository.js'
import { DynamoDBPasswordResetTokenRepository } from '../../infrastructure/repositories/dynamodb-password-reset-token.repository.js'
import { DynamoDBUserTenantMembershipRepository } from '../../infrastructure/repositories/dynamodb-user-tenant-membership.repository.js'

// Services
import { PasswordHasher } from '../../infrastructure/adapters/bcrypt-password-hasher.js'
import { BcryptPasswordHasher } from '../../infrastructure/adapters/bcrypt-password-hasher.js'
import { EventBusService } from '../events/event-bus.service.js'
import { EventBridgeService } from '../events/event-bus.service.js'
import { BillingServiceClient, HttpBillingServiceClient } from '../../infrastructure/adapters/billing-service.client.js'

// Use Cases - Auth
import { RegisterUserUseCase } from '../../core/auth/use-cases/register-user.use-case.js'
import { LoginUseCase } from '../../core/auth/use-cases/login.use-case.js'
import { RefreshTokenUseCase } from '../../core/auth/use-cases/refresh-token.use-case.js'
import { LogoutUseCase } from '../../core/auth/use-cases/logout.use-case.js'
import { VerifyEmailUseCase } from '../../core/auth/use-cases/verify-email.use-case.js'
import { ResendVerificationCodeUseCase } from '../../core/auth/use-cases/resend-verification-code.use-case.js'
import { RequestPasswordResetUseCase } from '../../core/auth/use-cases/request-password-reset.use-case.js'
import { ResetPasswordUseCase } from '../../core/auth/use-cases/reset-password.use-case.js'

// Use Cases - Users
import { GetUserProfileUseCase } from '../../core/users/use-cases/get-user-profile.use-case.js'
import { UpdateUserProfileUseCase } from '../../core/users/use-cases/update-user-profile.use-case.js'
import { ChangePasswordUseCase } from '../../core/users/use-cases/change-password.use-case.js'
import { DeleteUserUseCase } from '../../core/users/use-cases/delete-user.use-case.js'

// Use Cases - Tenants
import { GetTenantUseCase } from '../../core/tenants/use-cases/get-tenant.use-case.js'
import { UpdateTenantUseCase } from '../../core/tenants/use-cases/update-tenant.use-case.js'
import { GetTenantMembersUseCase } from '../../core/tenants/use-cases/get-tenant-members.use-case.js'

// Use Cases - Invites
import { CreateInviteUseCase } from '../../core/invites/use-cases/create-invite.use-case.js'
import { AcceptInviteUseCase } from '../../core/invites/use-cases/accept-invite.use-case.js'
import { ListTenantInvitesUseCase } from '../../core/invites/use-cases/list-tenant-invites.use-case.js'
import { CancelInviteUseCase } from '../../core/invites/use-cases/cancel-invite.use-case.js'
import { ResendInviteUseCase } from '../../core/invites/use-cases/resend-invite.use-case.js'

// Use Cases - Memberships
import { ListUserTenantsUseCase } from '../../core/memberships/use-cases/list-user-tenants.use-case.js'

// Container setup
const container = new Container()

// Bind Repositories
container.bind<UserRepository>(TYPES.UserRepository).to(DynamoDBUserRepository)
container.bind<TenantRepository>(TYPES.TenantRepository).to(DynamoDBTenantRepository)
container.bind<InviteRepository>(TYPES.InviteRepository).to(DynamoDBInviteRepository)
container.bind<RefreshTokenRepository>(TYPES.RefreshTokenRepository).to(DynamoDBRefreshTokenRepository)
container.bind<PasswordResetTokenRepository>(TYPES.PasswordResetTokenRepository).to(DynamoDBPasswordResetTokenRepository)
container.bind<UserTenantMembershipRepository>(TYPES.UserTenantMembershipRepository).to(DynamoDBUserTenantMembershipRepository)

// Bind Services
container.bind<PasswordHasher>(TYPES.PasswordHasher).to(BcryptPasswordHasher)
container.bind<EventBusService>(TYPES.EventBusService).to(EventBridgeService)
container.bind<BillingServiceClient>(TYPES.BillingServiceClient).to(HttpBillingServiceClient)

// Bind Use Cases - Auth
container.bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase).to(RegisterUserUseCase)
container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase)
container.bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase)
container.bind<LogoutUseCase>(TYPES.LogoutUseCase).to(LogoutUseCase)
container.bind<VerifyEmailUseCase>(TYPES.VerifyEmailUseCase).to(VerifyEmailUseCase)
container.bind<ResendVerificationCodeUseCase>(TYPES.ResendVerificationCodeUseCase).to(ResendVerificationCodeUseCase)
container.bind<RequestPasswordResetUseCase>(TYPES.RequestPasswordResetUseCase).to(RequestPasswordResetUseCase)
container.bind<ResetPasswordUseCase>(TYPES.ResetPasswordUseCase).to(ResetPasswordUseCase)

// Bind Use Cases - Users
container.bind<GetUserProfileUseCase>(TYPES.GetUserProfileUseCase).to(GetUserProfileUseCase)
container.bind<UpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase)
container.bind<ChangePasswordUseCase>(TYPES.ChangePasswordUseCase).to(ChangePasswordUseCase)
container.bind<DeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase)

// Bind Use Cases - Tenants
container.bind<GetTenantUseCase>(TYPES.GetTenantUseCase).to(GetTenantUseCase)
container.bind<UpdateTenantUseCase>(TYPES.UpdateTenantUseCase).to(UpdateTenantUseCase)
container.bind<GetTenantMembersUseCase>(TYPES.GetTenantMembersUseCase).to(GetTenantMembersUseCase)

// Bind Use Cases - Invites
container.bind<CreateInviteUseCase>(TYPES.CreateInviteUseCase).to(CreateInviteUseCase)
container.bind<AcceptInviteUseCase>(TYPES.AcceptInviteUseCase).to(AcceptInviteUseCase)
container.bind<ListTenantInvitesUseCase>(TYPES.ListTenantInvitesUseCase).to(ListTenantInvitesUseCase)
container.bind<CancelInviteUseCase>(TYPES.CancelInviteUseCase).to(CancelInviteUseCase)
container.bind<ResendInviteUseCase>(TYPES.ResendInviteUseCase).to(ResendInviteUseCase)

// Bind Use Cases - Memberships
container.bind<ListUserTenantsUseCase>(TYPES.ListUserTenantsUseCase).to(ListUserTenantsUseCase)

export { container }
