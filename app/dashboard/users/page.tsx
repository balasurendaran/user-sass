import { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasPermission, UserMgmtPermissions } from "@/lib/permissions"
import { getAllUsers, getAllRoles } from "./actions"
import { UserTable } from "./user-table"

export const metadata: Metadata = {
  title: "User Management | UserSaaS",
  description: "Manage users and their roles within your organization.",
}

export default async function UsersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user has permission to view users
  // Note: We use 'user:view' which I added in seed-rbac.ts
  if (!hasPermission(session.user, "user:view")) {
    redirect("/dashboard")
  }

  const users = await getAllUsers()
  const roles = await getAllRoles()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your team members and their access levels.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <UserTable initialUsers={users} roles={roles} />
      </div>
    </div>
  )
}
