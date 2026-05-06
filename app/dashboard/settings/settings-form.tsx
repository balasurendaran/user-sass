"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfile, updateOrganization, createRole } from "./actions"

export function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)

    if (result.success) {
      toast.success("Profile updated successfully!")
    } else {
      toast.error("Failed to update profile.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" defaultValue={user?.full_name || ""} placeholder="John Doe" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function OrganizationForm({ organization }: { organization: any }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateOrganization(formData)
    setLoading(false)

    if (result.success) {
      toast.success(organization ? "Organization updated!" : "Organization created!")
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
        <CardDescription>Manage your organization's public profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org_name">Organization Name</Label>
            <Input id="org_name" name="org_name" defaultValue={organization?.name || ""} placeholder="Acme Inc." required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org_slug">Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">user-saas.com/</span>
              <Input id="org_slug" name="org_slug" defaultValue={organization?.slug || ""} placeholder="acme-inc" required />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : (organization ? "Update Organization" : "Create Organization")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RoleForm({ roles, orgId }: { roles: any[], orgId?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createRole(formData)
    setLoading(false)

    if (result.success) {
      toast.success("Role created successfully!")
      const form = document.getElementById("role-form") as HTMLFormElement
      form?.reset()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & RBAC</CardTitle>
        <CardDescription>Create and manage custom roles for your organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form id="role-form" action={handleSubmit} className="flex items-end gap-4 border p-4 rounded-lg bg-muted/20">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="role_name">Role Name</Label>
            <Input id="role_name" name="role_name" placeholder="e.g. Project Manager" required />
          </div>
          <Button type="submit" disabled={loading || !orgId}>
            {loading ? "Adding..." : "Add Role"}
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Existing Roles</h3>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No custom roles created yet.</p>
          ) : (
            <div className="grid gap-2">
              {roles.map((role: any) => (
                <div key={role.id} className="flex items-center justify-between p-3 border rounded-md">
                  <span>{role.name}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Custom</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
