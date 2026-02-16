// Organization/Tenant data
export interface Organization {
  id: string
  name: string
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  planSlug: 'FREE' | 'ESSENCIAL' | 'PRO'
}

// Membership data
export interface OrganizationMembership {
  tenant: Organization
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  isDefault: boolean
  joinedAt: string
}

// API Response
export interface ListOrganizationsResponse {
  data: {
    tenants: OrganizationMembership[]
  }
  message: string
}
