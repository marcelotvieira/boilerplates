// Tenant data from GET /tenants/me
export interface Tenant {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  members: {
    total: number
    data: TenantMember[]
  }
}

// Member data from GET /tenants/me/members
export interface TenantMember {
  id: string
  email: string
  fullName: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  emailVerified: boolean
  createdAt: string
}

// Invite data from GET /invites
export interface Invite {
  token: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
  createdAt: string
  expiresAt: string
}

// Response types
export interface GetTenantResponse {
  data: Tenant
  message: string
}

export interface UpdateTenantResponse {
  data: Omit<Tenant, 'members'>
  message: string
}

export interface GetMembersResponse {
  data: {
    members: TenantMember[]
    total: number
  }
  message: string
}

export interface GetInvitesResponse {
  data: {
    invites: Invite[]
    total: number
  }
  message: string
}

export interface CreateInviteResponse {
  data: Invite
  message: string
}

// Input types
export interface UpdateTenantInput {
  name: string
}

export interface CreateInviteInput {
  email: string
  role: 'ADMIN' | 'MEMBER'
}
