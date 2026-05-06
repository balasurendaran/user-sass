"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Icons } from "@/components/ui/icons"
import { updateUserRole, createUser, deleteUser, toggleUserStatus } from "./actions"

interface UserTableProps {
  initialUsers: any[]
  roles: any[]
}

export function UserTable({ initialUsers, roles }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  async function handleRoleChange(userId: string, roleId: string) {
    setUpdatingId(userId)
    try {
      await updateUserRole(userId, roleId)
      toast.success("User role updated successfully")
      
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const newRole = roles.find(r => r.id === roleId)
          return { ...u, role_id: roleId, role_name: newRole?.name }
        }
        return u
      }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role")
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleStatusToggle(userId: string, currentStatus: boolean) {
    const newStatus = !currentStatus
    try {
      await toggleUserStatus(userId, newStatus)
      toast.success(`User ${newStatus ? "activated" : "deactivated"} successfully`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: newStatus } : u))
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    try {
      await deleteUser(userId)
      toast.success("User deleted successfully")
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries()) as any

    try {
      await createUser(data)
      toast.success("User created successfully")
      setIsCreateOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 py-2">
        <h3 className="text-lg font-semibold text-foreground/80">User Directory</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shadow-sm">
              <Icons.add className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Invite a new team member to your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_id">Assigned Role</Label>
                  <Select name="role_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                  {isCreating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Create User Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">User Details</TableHead>
                <TableHead className="w-[200px]">Access Level</TableHead>
                <TableHead className="w-[150px]">Account Status</TableHead>
                <TableHead className="w-[150px]">Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icons.user className="h-8 w-8 opacity-20" />
                      <span>No team members found in this directory.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">{user.full_name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role_name === "SUPER_ADMIN" ? "default" : "secondary"} className="text-[10px] uppercase font-bold px-1.5 h-5">
                          {user.role_name || "None"}
                        </Badge>
                        <Select 
                          defaultValue={user.role_id} 
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger className="w-[110px] h-7 text-[10px] font-medium">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id} className="text-xs">
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Switch 
                          checked={user.is_active} 
                          onCheckedChange={() => handleStatusToggle(user.id, user.is_active)}
                          className="scale-75 origin-left"
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${user.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
