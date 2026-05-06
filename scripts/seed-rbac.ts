import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log("Seeding RBAC data...")

  try {
    // 1. Seed Permissions
    const permissions = [
      { key: "user:view", module: "core", description: "View users" },
      { key: "user:manage", module: "core", description: "Create, Edit, Delete users" },
      { key: "role:view", module: "core", description: "View roles" },
      { key: "role:manage", module: "core", description: "Create, Edit, Delete roles" },
      { key: "timesheet:submit", module: "timesheet", description: "Submit timesheets" },
      { key: "timesheet:approve", module: "timesheet", description: "Approve timesheets" },
      { key: "timesheet:manage_projects", module: "timesheet", description: "Manage projects" },
      { key: "timesheet:view_reports", module: "timesheet", description: "View timesheet reports" },
    ]

    console.log("Inserting permissions...")
    for (const p of permissions) {
      await sql`
        INSERT INTO permissions (key, module, description)
        VALUES (${p.key}, ${p.module}, ${p.description})
        ON CONFLICT (key) DO UPDATE SET 
          description = EXCLUDED.description,
          module = EXCLUDED.module
      `
    }

    // 2. Create System Roles (Organization-less or Global)
    // For simplicity in this demo, we'll create some "Default" roles that can be used by any org
    // or we'll create a default "System" organization.
    
    let systemOrgId: string;
    const orgs = await sql`INSERT INTO organizations (name, slug) VALUES ('System', 'system') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
    systemOrgId = orgs[0].id;

    const roles = [
      { name: "SUPER_ADMIN", is_system: true, permissions: ["user:view", "user:manage", "role:view", "role:manage", "timesheet:submit", "timesheet:approve", "timesheet:manage_projects", "timesheet:view_reports"] },
      { name: "HR_MANAGER", is_system: true, permissions: ["user:view", "user:manage", "timesheet:view_reports"] },
      { name: "PROJECT_MANAGER", is_system: true, permissions: ["timesheet:submit", "timesheet:approve", "timesheet:manage_projects", "timesheet:view_reports"] },
      { name: "CONSULTANT", is_system: true, permissions: ["timesheet:submit"] },
    ]

    console.log("Inserting roles and linking permissions...")
    for (const r of roles) {
      const insertedRoles = await sql`
        INSERT INTO roles (name, organization_id, is_system)
        VALUES (${r.name}, ${systemOrgId}, ${r.is_system})
        ON CONFLICT (name, organization_id) DO UPDATE SET 
          is_system = EXCLUDED.is_system
        RETURNING id
      `
      const roleId = insertedRoles[0].id

      // Link permissions to role
      // First, clear existing links for this role (to make seed idempotent)
      await sql`DELETE FROM role_permissions WHERE role_id = ${roleId}`

      for (const pKey of r.permissions) {
        const perms = await sql`SELECT id FROM permissions WHERE key = ${pKey}`
        if (perms.length > 0) {
          await sql`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (${roleId}, ${perms[0].id})
            ON CONFLICT DO NOTHING
          `
        }
      }
    }

    console.log("RBAC seeding complete!")
  } catch (error) {
    console.error("Error seeding RBAC data:", error)
    process.exit(1)
  }
}

main()
