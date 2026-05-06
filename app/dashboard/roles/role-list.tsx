"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updateRolePermissions, createPermission, createRole, updateRoleName } from "./actions"
import { Icons } from "@/components/ui/icons"

interface RoleListProps {
  initialRoles: any[]
  allPermissions: any[]
}

export function RoleList({ initialRoles, allPermissions }: RoleListProps) {
  const [roles, setRoles] = useState(initialRoles)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRoleName, setEditingRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false)
  const [isCreatingPermission, setIsCreatingPermission] = useState(false)
  
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  const handleEdit = (role: any) => {
    setEditingRoleId(role.id)
    setEditingRoleName(role.name)
    setSelectedPermissions(role.permissions?.map((p: any) => p.id) || [])
  }

  const handleCancel = () => {
    setEditingRoleId(null)
    setEditingRoleName("")
    setSelectedPermissions([])
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId) 
        : [...prev, permissionId]
    )
  }

  const handleSave = async () => {
    if (!editingRoleId) return
    
    setIsSaving(true)
    try {
      const originalRole = roles.find(r => r.id === editingRoleId)
      
      // Update name if changed and not system role
      if (editingRoleName !== originalRole.name && !originalRole.is_system) {
        await updateRoleName(editingRoleId, editingRoleName)
      }
      
      // Update permissions
      await updateRolePermissions(editingRoleId, selectedPermissions)
      
      toast.success("Role updated successfully")
      
      setRoles(prev => prev.map(r => {
        if (r.id === editingRoleId) {
          const newPerms = allPermissions.filter(p => selectedPermissions.includes(p.id))
          return { ...r, name: editingRoleName, permissions: newPerms }
        }
        return r
      }))
      setEditingRoleId(null)
    } catch (error) {
      toast.error("Failed to update role")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreatePermission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreatingPermission(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      key: formData.get("key") as string,
      module: formData.get("module") as string,
      description: formData.get("description") as string,
    }

    try {
      await createPermission(data)
      toast.success("Permission created successfully")
      setIsCreatePermissionOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to create permission")
    } finally {
      setIsCreatingPermission(false)
    }
  }

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreatingRole(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    try {
      await createRole(name)
      toast.success("Role created successfully")
      setIsCreateRoleOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to create role")
    } finally {
      setIsCreatingRole(false)
    }
  }

  const groupedPermissions = allPermissions.reduce((acc: any, p: any) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-end gap-3 px-1">
        <Dialog open={isCreatePermissionOpen} onOpenChange={setIsCreatePermissionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-sm">
              <Icons.add className="mr-2 h-4 w-4" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreatePermission}>
              <DialogHeader>
                <DialogTitle>Create Permission</DialogTitle>
                <DialogDescription>
                  Define a new unique permission key.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key (e.g., users:export)</Label>
                  <Input id="key" name="key" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Input id="module" name="module" placeholder="core" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreatingPermission} className="w-full">
                  Create Permission
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shadow-sm">
              <Icons.shield className="mr-2 h-4 w-4" />
              Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleCreateRole}>
              <DialogHeader>
                <DialogTitle>Create Role</DialogTitle>
                <DialogDescription>
                  Enter a name for the new role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Support Agent" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreatingRole} className="w-full">
                  Create Role
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id} className={`flex flex-col h-full transition-all duration-200 ${editingRoleId === role.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  {editingRoleId === role.id && !role.is_system ? (
                    <div className="space-y-2">
                      <Label htmlFor={`name-${role.id}`} className="text-xs font-bold uppercase text-muted-foreground">Role Name</Label>
                      <Input 
                        id={`name-${role.id}`}
                        value={editingRoleName}
                        onChange={(e) => setEditingRoleName(e.target.value)}
                        className="font-semibold text-lg h-9"
                      />
                    </div>
                  ) : (
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {role.name}
                      {role.is_system && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">System</Badge>
                      )}
                    </CardTitle>
                  )}
                  <CardDescription className="text-sm">
                    {role.organization_id ? "Custom Organization Role" : "Global System Role"}
                  </CardDescription>
                </div>
                {editingRoleId !== role.id && (
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(role)} className="h-8">
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              {editingRoleId === role.id ? (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
                    <div key={module} className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-1 mb-2">
                        {module} Module
                      </h4>
                      <div className="space-y-3">
                        {perms.map((p: any) => (
                          <div key={p.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Checkbox 
                              id={`${role.id}-${p.id}`} 
                              checked={selectedPermissions.includes(p.id)}
                              onCheckedChange={() => togglePermission(p.id)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label 
                                htmlFor={`${role.id}-${p.id}`}
                                className="text-sm font-semibold cursor-pointer"
                              >
                                {p.key}
                              </Label>
                              <p className="text-xs text-muted-foreground leading-normal">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-6 border-t mt-6">
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[100px]">
                      {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Update Role
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.length > 0 ? (
                      role.permissions.map((p: any) => (
                        <Badge key={p.id} variant="outline" className="bg-muted/30 font-mono text-[10px] py-0.5">
                          {p.key}
                        </Badge>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 w-full text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Icons.shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
