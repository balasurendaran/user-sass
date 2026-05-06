"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { logAction } from "@/lib/audit"

export async function getAllRolesWithPermissions() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const roles = await sql`
    SELECT 
      r.id, r.name, r.is_system, r.organization_id,
      json_agg(p.*) FILTER (WHERE p.id IS NOT NULL) as permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id
    ORDER BY r.name ASC
  `
  return roles
}

export async function getAllPermissions() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const permissions = await sql`
    SELECT id, key, description, module
    FROM permissions
    ORDER BY module, key ASC
  `
  return permissions
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, "role:manage")) {
    throw new Error("Unauthorized")
  }

  try {
    // Start a transaction-like sequence (Neon doesn't support full SQL transactions in the serverless driver easily with individual `sql` calls, but we can do it in one go if we use the right syntax or just sequential calls)
    // For simplicity, we clear and re-insert
    await sql`DELETE FROM role_permissions WHERE role_id = ${roleId}`
    
    if (permissionIds.length > 0) {
      for (const pId of permissionIds) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${roleId}, ${pId})
        `
      }
    }

    await logAction("UPDATE_ROLE_PERMISSIONS", "role", roleId, { permissionIds })
    revalidatePath("/dashboard/roles")
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating role permissions:", error)
    throw new Error("Failed to update role permissions")
  }
}

export async function createPermission(data: { key: string, module: string, description: string }) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, "role:manage")) {
    throw new Error("Unauthorized")
  }

  try {
    await sql`
      INSERT INTO permissions (key, module, description)
      VALUES (${data.key.trim()}, ${data.module.trim()}, ${data.description.trim()})
      ON CONFLICT (key) DO NOTHING
    `
    await logAction("CREATE_PERMISSION", "permission", data.key, data)
    revalidatePath("/dashboard/roles")
    return { success: true }
  } catch (error) {
    console.error("Error creating permission:", error)
    throw new Error("Failed to create permission")
  }
}

export async function createRole(name: string) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, "role:manage")) {
    throw new Error("Unauthorized")
  }

  try {
    const orgId = session.user.organization_id
    await sql`
      INSERT INTO roles (name, organization_id, is_system)
      VALUES (${name.trim()}, ${orgId}, false)
    `
    await logAction("CREATE_ROLE", "role", name)
    revalidatePath("/dashboard/roles")
    return { success: true }
  } catch (error) {
    console.error("Error creating role:", error)
    throw new Error("Failed to create role")
  }
}

export async function updateRoleName(roleId: string, newName: string) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, "role:manage")) {
    throw new Error("Unauthorized")
  }

  try {
    await sql`
      UPDATE roles 
      SET name = ${newName.trim()} 
      WHERE id = ${roleId} AND is_system = false
    `
    await logAction("UPDATE_ROLE_NAME", "role", roleId, { newName })
    revalidatePath("/dashboard/roles")
    return { success: true }
  } catch (error) {
    console.error("Error updating role name:", error)
    throw new Error("Failed to update role name")
  }
}

