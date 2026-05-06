import { sql } from "./db"
import { getSession } from "./auth"

export async function logAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) {
  try {
    const session = await getSession()
    const userId = session?.user?.id

    await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (${userId || null}, ${action}, ${entityType}, ${entityId || null}, ${JSON.stringify(details)})
    `
  } catch (error) {
    console.error("Failed to log audit entry:", error)
    // We don't throw here to avoid breaking the main action if logging fails
  }
}
