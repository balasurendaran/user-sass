export interface Permission {
  id: string
  key: string
  description?: string
  module: string
}

export interface Role {
  id: string
  name: string
  organization_id?: string
  is_system: boolean
  permissions?: Permission[]
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: Date
}

export interface User {
  id: string
  email: string
  role_id?: string
  role?: Role
  organization_id?: string
  full_name?: string
  created_at: Date
  updated_at: Date
}

export interface PasswordReset {
  token: string
  user_id: string
  expires_at: Date
  created_at: Date
}
