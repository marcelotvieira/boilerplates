import { injectable } from 'inversify'
import { InviteRepository } from '../../core/invites/repositories/invite.repository.interface.js'
import { Invite } from '../../core/invites/entities/invite.entity.js'
import { InviteModel, InviteDocument } from '../database/models/invite.model.js'
import { KeyBuilder, EntityType } from '../database/base.schema.js'
import { Logger } from '../../shared/utils/logger.js'

@injectable()
export class DynamoDBInviteRepository implements InviteRepository {
  private readonly logger = Logger.of('DynamoDBInviteRepository')

  async save(invite: Invite): Promise<void> {
    this.logger.info('Saving invite', {
      token: invite.token,
      email: invite.email,
      tenantId: invite.tenantId
    })

    try {
      const keys = KeyBuilder.buildInviteKeys(invite.token)
      const emailGSI = KeyBuilder.buildInviteEmailGSI(invite.email, invite.tenantId)
      const tenantGSI = KeyBuilder.buildTenantInvitesGSI(invite.tenantId, invite.token)

      const inviteDocument: Partial<InviteDocument> = {
        ...keys,
        ...emailGSI,
        ...tenantGSI,
        entityType: EntityType.INVITE,
        id: invite.token,
        token: invite.token,
        tenantId: invite.tenantId,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdBy: invite.createdBy,
        acceptedAt: invite.acceptedAt
      }

      const existingInvite = await this.findByToken(invite.token)

      if (existingInvite) {
        this.logger.info('Invite exists, updating', { token: invite.token })
        await InviteModel.update(keys, {
          status: invite.status,
          acceptedAt: invite.acceptedAt
        })
      } else {
        this.logger.info('New invite, creating', { token: invite.token })
        await InviteModel.create(inviteDocument)
      }

      this.logger.info('Invite saved successfully', { token: invite.token })

    } catch (error: any) {
      this.logger.error('Error saving invite', error, {
        token: invite.token
      })
      throw error
    }
  }

  async findByToken(token: string): Promise<Invite | null> {
    this.logger.info('Finding invite by token', { token })

    try {
      const keys = KeyBuilder.buildInviteKeys(token)
      const inviteDoc = await InviteModel.get(keys)

      if (!inviteDoc) {
        this.logger.info('Invite not found', { token })
        return null
      }

      const invite = this.mapDocumentToEntity(inviteDoc as unknown as InviteDocument)
      this.logger.info('Invite found', { token, email: invite.email })
      return invite

    } catch (error: any) {
      this.logger.error('Error finding invite by token', error, {
        token
      })
      throw error
    }
  }

  async findByTenantId(tenantId: string): Promise<Invite[]> {
    this.logger.info('Finding invites by tenant', { tenantId })

    try {
      const inviteDocs = await InviteModel.query('GSI2PK')
        .eq(`TENANT#${tenantId}#INVITES`)
        .using('GSI2')
        .exec()

      const invites = inviteDocs.map(doc => this.mapDocumentToEntity(doc as unknown as InviteDocument))
      this.logger.info('Invites found by tenant', {
        tenantId,
        count: invites.length
      })

      return invites

    } catch (error: any) {
      this.logger.error('Error finding invites by tenant', error, {
        tenantId
      })
      throw error
    }
  }

  async findByEmailAndTenant(email: string, tenantId: string): Promise<Invite | null> {
    this.logger.info('Finding invite by email and tenant', { email, tenantId })

    try {
      const invites = await InviteModel.query('GSI1PK')
        .eq(`INVITE#EMAIL#${email}`)
        .where('GSI1SK').eq(`TENANT#${tenantId}`)
        .using('GSI1')
        .exec()

      if (!invites.length) {
        this.logger.info('Invite not found by email and tenant', { email, tenantId })
        return null
      }

      const invite = this.mapDocumentToEntity(invites[0] as unknown as InviteDocument)
      this.logger.info('Invite found by email and tenant', { email, tenantId, token: invite.token })
      return invite

    } catch (error: any) {
      this.logger.error('Error finding invite by email and tenant', error, {
        email,
        tenantId
      })
      throw error
    }
  }

  async delete(token: string): Promise<void> {
    this.logger.info('Deleting invite', { token })

    try {
      const keys = KeyBuilder.buildInviteKeys(token)
      await InviteModel.delete(keys)
      this.logger.info('Invite deleted successfully', { token })

    } catch (error: any) {
      this.logger.error('Error deleting invite', error, {
        token
      })
      throw error
    }
  }

  private mapDocumentToEntity(doc: InviteDocument): Invite {
    return new Invite({
      token: doc.token,
      tenantId: doc.tenantId,
      email: doc.email,
      role: doc.role,
      status: doc.status,
      expiresAt: doc.expiresAt,
      createdBy: doc.createdBy,
      acceptedAt: doc.acceptedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })
  }
}
