import { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import { sql } from "@/lib/db"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Audit Logs | UserSaaS",
  description: "Monitor system activity and changes.",
}

export default async function AuditPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Only Super Admins should see this
  if (session.user.role?.name !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  const logs = await sql`
    SELECT 
      l.*,
      u.email as user_email
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 50
  `

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all administrative actions and system changes.
        </p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs font-medium">{log.user_email || "System"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {log.entity_type} {log.entity_id && `(${log.entity_id})`}
                </TableCell>
                <TableCell className="text-xs max-w-[300px] truncate">
                  {JSON.stringify(log.details)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No logs found yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
