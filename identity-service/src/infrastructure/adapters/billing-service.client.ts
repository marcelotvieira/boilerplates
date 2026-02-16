import { injectable } from 'inversify'
import { config } from '../../shared/config/environment.js'
import { Logger } from '../../shared/utils/logger.js'
import type { PlanEntitlements, ModuleEntitlements } from '../../shared/types/entitlements.types.js'

export type { PlanEntitlements }

export interface BillingServiceClient {
  getPlanEntitlements(planSlug: string, accessToken: string): Promise<PlanEntitlements>
}

const DEFAULT_FREE_ENTITLEMENTS: PlanEntitlements = {
  plan: 'FREE',
  entitlements: {
    workspace: { limits: { members: 3 } },
  }
}

@injectable()
export class HttpBillingServiceClient implements BillingServiceClient {
  private readonly logger = Logger.of('BillingServiceClient')
  private readonly baseUrl = config.BILLING_SERVICE_URL

  async getPlanEntitlements(planSlug: string, accessToken: string): Promise<PlanEntitlements> {
    try {
      const response = await fetch(
        `${this.baseUrl}/plans/${encodeURIComponent(planSlug)}/entitlements`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        this.logger.warn('Billing service returned non-OK status, using fallback', {
          status: response.status,
          planSlug
        })
        return DEFAULT_FREE_ENTITLEMENTS
      }

      const body = await response.json() as { data: { plan: string; entitlements: Record<string, { limits?: Record<string, number>; label?: string }> } }

      // Strip label — JWT only needs limits
      const stripped: ModuleEntitlements = {}
      for (const [mod, moduleConfig] of Object.entries(body.data.entitlements)) {
        stripped[mod] = { limits: moduleConfig.limits }
      }

      return { plan: body.data.plan, entitlements: stripped }
    } catch (error) {
      this.logger.warn('Billing service unreachable, using fallback entitlements', {
        planSlug,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return DEFAULT_FREE_ENTITLEMENTS
    }
  }
}
