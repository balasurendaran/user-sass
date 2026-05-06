import { User } from "@/types"

/**
 * Checks if a user has a specific permission key.
 * The permission key follows the format 'module:action' (e.g., 'timesheet:submit').
 */
export function hasPermission(user: User, permissionKey: string): boolean {
  // If the user has no role or the role has no permissions, they have no access
  if (!user.role || !user.role.permissions) {
    return false
  }

  // Support for system-wide Super Admin (can be identified by name or a specific flag)
  if (user.role.name === "SUPER_ADMIN" && user.role.is_system) {
    return true
  }

  return user.role.permissions.some((p) => p.key === permissionKey)
}

/**
 * Utility to check if a user belongs to a specific organization
 */
export function isOrgMember(user: User, organizationId: string): boolean {
  return user.organization_id === organizationId
}

/**
 * Domain-specific checks (Modular)
 */
export const TimesheetPermissions = {
  SUBMIT: "timesheet:submit",
  APPROVE: "timesheet:approve",
  MANAGE_PROJECTS: "timesheet:manage_projects",
  VIEW_REPORTS: "timesheet:view_reports",
}

export const CMSPermissions = {
  CREATE: "cms:create",
  PUBLISH: "cms:publish",
  DELETE: "cms:delete",
}

export const UserMgmtPermissions = {
  UPGRADE: "user:upgrade",
  TERMINATE: "user:terminate",
}
