import { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import { getAllRolesWithPermissions, getAllPermissions } from "./actions"
import { RoleList } from "./role-list"

export const metadata: Metadata = {
  title: "Role Management | UserSaaS",
  description: "Configure roles and permissions for your organization.",
}

export default async function RolesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!hasPermission(session.user, "role:view")) {
    redirect("/dashboard")
  }

  const roles = await getAllRolesWithPermissions()
  const permissions = await getAllPermissions()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Define access levels and assign permissions to roles.
          </p>
        </div>
      </div>

      <RoleList initialRoles={roles} allPermissions={permissions} />
    </div>
  )
}
