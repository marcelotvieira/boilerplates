export interface ModuleConfig {
  limits?: Record<string, number>
  label: string
}

export interface PlanPriceOption {
  value: number
  priceId?: string
}

export interface PlanPrice {
  monthly?: PlanPriceOption
  yearly?: PlanPriceOption
}

export interface PlanInfo {
  slug: string
  name: string
  modules: Record<string, ModuleConfig>
  price: PlanPrice
}

export interface ListPlansResponse {
  data: { plans: PlanInfo[] }
  message: string
}

export interface SubscriptionInfo {
  status: string
  planType: string
  interval?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
}

export interface GetSubscriptionInfoResponse {
  data: SubscriptionInfo
  message: string
}
