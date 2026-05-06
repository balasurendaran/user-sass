"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession, hashPassword } from "@/lib/auth"
import { hasPermission, UserMgmtPermissions } from "@/lib/permissions"
import { z } from "zod"
import { logAction } from "@/lib/audit"

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role_id: z.string().uuid(),
})

export async function updateUserRole(userId: string, roleId: string) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, UserMgmtPermissions.UPGRADE)) {
    throw new Error("Unauthorized")
  }

  try {
    await sql`
      UPDATE users 
      SET role_id = ${roleId}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
    await logAction("UPDATE_ROLE", "user", userId, { newRoleId: roleId })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }
}

export async function createUser(data: z.infer<typeof createUserSchema>) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, UserMgmtPermissions.UPGRADE)) {
    throw new Error("Unauthorized")
  }

  const { email, password, full_name, role_id } = createUserSchema.parse(data)
  const hashedPassword = await hashPassword(password)

  try {
    await sql`
      INSERT INTO users (email, password_hash, full_name, role_id, organization_id)
      VALUES (${email}, ${hashedPassword}, ${full_name}, ${role_id}, ${session.user.organization_id})
    `
    await logAction("CREATE_USER", "user", email, { role_id })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, UserMgmtPermissions.TERMINATE)) {
    throw new Error("Unauthorized")
  }

  if (userId === session.user.id) {
    throw new Error("You cannot delete yourself")
  }

  try {
    await sql`DELETE FROM users WHERE id = ${userId}`
    await logAction("DELETE_USER", "user", userId)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await getSession()
  if (!session || !hasPermission(session.user, UserMgmtPermissions.UPGRADE)) {
    throw new Error("Unauthorized")
  }

  try {
    await sql`
      UPDATE users 
      SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
    await logAction("TOGGLE_STATUS", "user", userId, { isActive })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error toggling user status:", error)
    throw new Error("Failed to update user status")
  }
}

export async function getAllUsers() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  // For multi-tenancy, we would filter by organization_id
  // but for super admins, they might see everything.
  const users = await sql`
    SELECT 
      u.id, u.email, u.full_name, u.organization_id, u.role_id, u.created_at, u.is_active,
      r.name as role_name,
      o.name as organization_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN organizations o ON u.organization_id = o.id
    ORDER BY u.created_at DESC
  `
  return users
}

export async function getAllRoles() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const roles = await sql`
    SELECT id, name, is_system, organization_id
    FROM roles
    ORDER BY name ASC
  `
  return roles
}
