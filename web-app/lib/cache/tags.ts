const CACHE_KEYS = {
  USER_TENANTS: 'user-tenants',
  USER_PROFILE: 'user-profile',
  CURRENT_TENANT: 'current-tenant',
  TENANT_MEMBERS: 'tenant-members',
  TENANT_INVITES: 'tenant-invites',
  PLANS: 'plans',
  SUBSCRIPTION: 'subscription',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

export default CACHE_KEYS;
