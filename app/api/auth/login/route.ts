import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { comparePassword, login } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const users = await sql`
      WITH RECURSIVE role_hierarchy AS (
        -- Get the initial role
        SELECT r.id, r.name, r.parent_role_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ${email}
        
        UNION ALL
        
        -- Recursively get parent roles
        SELECT r.id, r.name, r.parent_role_id
        FROM roles r
        INNER JOIN role_hierarchy rh ON rh.parent_role_id = r.id
      )
      SELECT 
        u.id, u.email, u.password_hash, u.full_name, u.organization_id, u.role_id, u.is_active,
        r.name as role_name,
        r.is_system as role_is_system,
        (
          SELECT json_agg(p.*)
          FROM (
            SELECT DISTINCT p.* 
            FROM role_hierarchy rh
            JOIN role_permissions rp ON rh.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
          ) p
        ) as permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ${email}
      GROUP BY u.id, r.id
    `

    const user = users[0]

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (user.is_active === false) {
      return NextResponse.json({ error: "Your account is inactive. Please contact your administrator." }, { status: 403 })
    }

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      organization_id: user.organization_id,
      role: {
        id: user.role_id,
        name: user.role_name,
        is_system: user.role_is_system,
        permissions: user.permissions || [],
      },
    }

    // Create session
    await login(userData)

    return NextResponse.json({
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
