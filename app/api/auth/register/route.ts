import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, login } from "@/lib/auth"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    // Get default role (CONSULTANT from system organization)
    const roles = await sql`
      SELECT id FROM roles 
      WHERE name = 'CONSULTANT' 
      AND organization_id = (SELECT id FROM organizations WHERE slug = 'system')
      LIMIT 1
    `
    const defaultRoleId = roles[0]?.id

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role_id)
      VALUES (${email}, ${hashedPassword}, ${email.split("@")[0]}, ${defaultRoleId})
      RETURNING id, email, full_name, role_id
    `

    const user = result[0]

    // Fetch full user data for session (including role/permissions)
    const fullUsers = await sql`
      SELECT 
        u.id, u.email, u.full_name, u.organization_id, u.role_id,
        r.name as role_name,
        r.is_system as role_is_system,
        json_agg(p.*) FILTER (WHERE p.id IS NOT NULL) as permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ${user.id}
      GROUP BY u.id, r.id
    `
    const fullUser = fullUsers[0]

    const userData = {
      id: fullUser.id,
      email: fullUser.email,
      full_name: fullUser.full_name,
      organization_id: fullUser.organization_id,
      role: {
        id: fullUser.role_id,
        name: fullUser.role_name,
        is_system: fullUser.role_is_system,
        permissions: fullUser.permissions || [],
      },
    }

    // Send welcome email
    await sendEmail(email, "Welcome to UserSaaS", emailTemplates.welcome(email.split("@")[0])).catch(console.error)

    // Create session
    await login(userData)

    return NextResponse.json({ 
      message: "User registered successfully",
      user: userData
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Handle Zod validation errors
    if (error.name === "ZodError" || error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 })
    }

    // Handle Database unique constraint errors
    if (error.message?.includes("unique constraint")) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
