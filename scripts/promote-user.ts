import "dotenv/config"
import { neon } from "@neondatabase/serverless"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const email = "bala11@gmail.com"

  try {
    const roles = await sql`SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1`
    
    if (roles.length === 0) {
      console.error("SUPER_ADMIN role not found. Have you run the seed script?")
      process.exit(1)
    }

    const roleId = roles[0].id
    await sql`UPDATE users SET role_id = ${roleId} WHERE email = ${email}`

    console.log(`Successfully promoted ${email} to SUPER_ADMIN!`)
  } catch (error) {
    console.error("Error promoting user:", error)
    process.exit(1)
  }
}

main()
