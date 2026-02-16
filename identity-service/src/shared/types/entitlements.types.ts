/**
 * Plan enum — kept for convenience/type safety
 */
export enum Plan {
  FREE = 'FREE',
  PRO = 'PRO'
}

/**
 * Modular entitlements — JWT-safe structure (no label, only limits)
 * Each module can have optional numeric limits.
 */
export type ModuleEntitlements = Record<string, { limits?: Record<string, number> }>

/**
 * PlanEntitlements — shape returned by billing-service
 */
export interface PlanEntitlements {
  plan: string
  entitlements: ModuleEntitlements
}
