import { supabaseAdmin } from "../db/supabaseClient"
import { hashSensitiveData } from "../utils/encryption"

export interface SessionData {
  userId: string
  deviceId: string
  ipAddress: string
  userAgent: string
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

export async function createSession(userId: string, meta: Omit<SessionData, "userId" | "createdAt" | "lastActiveAt">): Promise<string> {
  const sessionId = hashSensitiveData(userId + Date.now() + Math.random())
  await supabaseAdmin.from("sessions").insert({
    id: sessionId,
    user_id: userId,
    device_id: meta.deviceId,
    ip_address: meta.ipAddress,
    user_agent: meta.userAgent,
    expires_at: meta.expiresAt,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  })
  return sessionId
}

export async function invalidateSession(sessionId: string) {
  await supabaseAdmin.from("sessions").delete().eq("id", sessionId)
}

export async function invalidateAllSessions(userId: string) {
  await supabaseAdmin.from("sessions").delete().eq("user_id", userId)
}

export async function refreshSessionActivity(sessionId: string) {
  await supabaseAdmin.from("sessions").update({ last_active_at: new Date().toISOString() }).eq("id", sessionId)
}
