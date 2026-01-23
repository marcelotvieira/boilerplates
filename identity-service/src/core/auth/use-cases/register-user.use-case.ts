import { inject, injectable } from 'inversify'
import { TYPES } from '../../../shared/container/types.js'
import { UserRepository } from '../../users/repositories/user.repository.interface.js'
import { TenantRepository } from '../../tenants/repositories/tenant.repository.interface.js'
import { PasswordHasher } from '../../../infrastructure/adapters/bcrypt-password-hasher.js'
import { EventBusService } from '../../../shared/events/event-bus.service.js'
import { User } from '../../users/entities/user.entity.js'
import { Tenant } from '../../tenants/entities/tenant.entity.js'
import { UserRole } from '../../users/enums/user-role.enum.js'
import { TenantStatus } from '../../tenants/enums/tenant-status.enum.js'
import { ConflictException } from '../../../shared/exceptions/app.exceptions.js'
import { Logger } from '../../../shared/utils/logger.js'
import { generateVerificationCode, calculateCodeExpiration } from '../../../shared/utils/verification-code.utils.js'
import { config } from '../../../shared/config/environment.js'
import { randomUUID } from 'crypto'
import { EVENT_SOURCE, EVENT_VERSION, EmailVerificationRequestedEvent, UserRegisteredEvent, TenantCreatedEvent } from '../../../shared/events/event-types.js'

export interface RegisterUserInput {
  fullName: string
  email: string
  password: string
}

export interface RegisterUserOutput {
  userId: string
  email: string
  fullName: string
  tenantId: string
  tenantName: string
  role: UserRole
  emailVerified: boolean
}

@injectable()
export class RegisterUserUseCase {
  private readonly logger = Logger.of('RegisterUserUseCase')

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.TenantRepository) private tenantRepository: TenantRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
    @inject(TYPES.EventBusService) private eventBus: EventBusService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    this.logger.info('Starting user registration', { email: input.email })

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      this.logger.warn('Registration attempt with existing email', { email: input.email })
      throw new ConflictException('A user with this email already exists')
    }

    // Generate verification code
    const verificationCode = generateVerificationCode(config.EMAIL_VERIFICATION_CODE_LENGTH)
    const verificationExpiresAt = calculateCodeExpiration(config.EMAIL_VERIFICATION_EXPIRATION_MINUTES)

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password)

    // Create tenant (auto-named as "Organização de {fullName}")
    const tenantId = randomUUID()
    const tenantName = `Organização de ${input.fullName}`
    const tenant = new Tenant({
      id: tenantId,
      name: tenantName,
      ownerId: '', // Will be set after user creation
      status: TenantStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create user
    const userId = randomUUID()
    const user = new User({
      id: userId,
      fullName: input.fullName,
      email: input.email,
      tenantId,
      passwordHash,
      role: UserRole.OWNER,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpiresAt: verificationExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Update tenant with ownerId
    const updatedTenant = new Tenant({
      ...tenant,
      ownerId: userId
    })

    // Save to database
    await Promise.all([
      this.userRepository.save(user),
      this.tenantRepository.save(updatedTenant)
    ])

    this.logger.info('User and tenant created successfully', {
      userId: user.id,
      tenantId: tenant.id,
      email: user.email
    })

    // Publish events
    await this.publishEvents(user, updatedTenant, verificationCode)

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      tenantId: user.tenantId,
      tenantName: updatedTenant.name,
      role: user.role,
      emailVerified: user.emailVerified
    }
  }

  private async publishEvents(user: User, tenant: Tenant, verificationCode: string): Promise<void> {
    const now = new Date().toISOString()

    // Publish EmailVerificationRequested event
    const emailVerificationEvent: EmailVerificationRequestedEvent = {
      eventId: randomUUID(),
      eventTime: now,
      source: EVENT_SOURCE,
      version: EVENT_VERSION,
      eventType: 'EmailVerificationRequested',
      data: {
        email: user.email,
        fullName: user.fullName,
        verificationCode,
        expiresAt: user.emailVerificationExpiresAt!.toISOString(),
        template: 'email-verification',
        templateData: {
          userName: user.fullName,
          code: verificationCode,
          expiresInMinutes: config.EMAIL_VERIFICATION_EXPIRATION_MINUTES
        }
      }
    }

    // Publish UserRegistered event
    const userRegisteredEvent: UserRegisteredEvent = {
      eventId: randomUUID(),
      eventTime: now,
      source: EVENT_SOURCE,
      version: EVENT_VERSION,
      eventType: 'UserRegistered',
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: user.tenantId,
        role: user.role,
        registrationType: 'direct'
      }
    }

    // Publish TenantCreated event
    const tenantCreatedEvent: TenantCreatedEvent = {
      eventId: randomUUID(),
      eventTime: now,
      source: EVENT_SOURCE,
      version: EVENT_VERSION,
      eventType: 'TenantCreated',
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        ownerId: tenant.ownerId,
        ownerEmail: user.email
      }
    }

    try {
      await this.eventBus.publishBatch([
        emailVerificationEvent,
        userRegisteredEvent,
        tenantCreatedEvent
      ])

      this.logger.info('Events published successfully', {
        userId: user.id,
        tenantId: tenant.id
      })
    } catch (error: any) {
      this.logger.error('Failed to publish events', error, {
        userId: user.id,
        tenantId: tenant.id
      })
      // Don't fail the registration if event publishing fails
      // The user is already created, events are for downstream services
    }
  }
}
