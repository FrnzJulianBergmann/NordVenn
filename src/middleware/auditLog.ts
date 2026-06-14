import { Request, Response, NextFunction } from "express"
import { supabaseAdmin } from "../db/supabaseClient"

interface AuditEvent {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  userAgent: string
  status: "success" | "failure"
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(event: AuditEvent) {
  await supabaseAdmin.from("audit_logs").insert({
    ...event,
    timestamp: new Date().toISOString(),
  })
}

export function auditMiddleware(action: string, resource: string) {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res)
    res.json = function (body) {
      logAuditEvent({
        userId: req.user?.id,
        action,
        resource,
        resourceId: req.params.id,
        ipAddress: req.ip ?? "unknown",
        userAgent: req.headers["user-agent"] ?? "unknown",
        status: res.statusCode < 400 ? "success" : "failure",
        metadata: { method: req.method, path: req.path },
      }).catch(console.error)
      return originalJson(body)
    }
    next()
  }
}
