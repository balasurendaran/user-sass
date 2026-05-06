import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm, OrganizationForm, RoleForm } from "./settings-form"

export default async function SettingsPage() {
  const session = await getSession()
  const user = session?.user

  // Fetch current organization data if available
  let organization = null
  if (user?.organization_id) {
    const orgs = await sql`SELECT * FROM organizations WHERE id = ${user.organization_id}`
    organization = orgs[0]
  }

  // Fetch roles for this organization
  let roles = []
  if (user?.organization_id) {
    roles = await sql`SELECT * FROM roles WHERE organization_id = ${user.organization_id}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm user={user} />
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <OrganizationForm organization={organization} />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleForm roles={roles} orgId={user?.organization_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
