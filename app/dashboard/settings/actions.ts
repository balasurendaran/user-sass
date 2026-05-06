"use server"

import { sql } from "@/lib/db"
import { getSession, login } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const fullName = formData.get("full_name") as string

  // Update DB
  await sql`
    UPDATE users 
    SET full_name = ${fullName}, updated_at = NOW() 
    WHERE id = ${session.user.id}
  `

  // Update session object
  const updatedUser = { ...session.user, full_name: fullName }

  // Refresh the session cookie
  await login(updatedUser)

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateOrganization(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("org_name") as string
  const slug = formData.get("org_slug") as string

  try {
    let orgId = session.user.organization_id

    if (orgId) {
      await sql`
        UPDATE organizations 
        SET name = ${name}, slug = ${slug} 
        WHERE id = ${orgId}
      `
    } else {
      // Check if slug is already taken by another org
      const existingOrg = await sql`SELECT id FROM organizations WHERE slug = ${slug}`
      if (existingOrg.length > 0) {
        return { error: "Organization URL slug is already taken. Please choose another." }
      }

      const result = await sql`
        INSERT INTO organizations (name, slug) 
        VALUES (${name}, ${slug}) 
        RETURNING id
      `
      orgId = result[0].id

      // Update user in DB
      await sql`
        UPDATE users SET organization_id = ${orgId} WHERE id = ${session.user.id}
      `

      // Update the session user object
      session.user.organization_id = orgId
    }

    // Refresh the session cookie so the UI knows we have an organization now
    await login(session.user)

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error: any) {
    console.error("Org update error:", error)
    if (error.message?.includes("unique constraint")) {
      return { error: "This organization URL is already in use." }
    }
    return { error: "Failed to update organization. Please try again." }
  }
}

export async function createRole(formData: FormData) {
  const session = await getSession()
  if (!session || !session.user.organization_id) {
    return { error: "Please create an organization first." }
  }

  const name = formData.get("role_name") as string

  try {
    await sql`
      INSERT INTO roles (name, organization_id) 
      VALUES (${name}, ${session.user.organization_id})
    `

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error: any) {
    return { error: "Failed to create role. It might already exist." }
  }
}
