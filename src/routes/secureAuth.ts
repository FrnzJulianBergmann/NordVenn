import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { authRateLimit } from "../middleware/rateLimit"
import { validateLoginInput } from "../middleware/validation"
import { logAuditEvent } from "../middleware/auditLog"
import { revokeToken, revokeAllUserTokens } from "../utils/tokenManager"
import { invalidateAllSessions } from "../services/sessionService"

const router = Router()

router.post("/logout", requireAuth, authRateLimit, async (req: any, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (token) await revokeToken(token)
    await logAuditEvent({ userId: req.user.id, action: "logout", resource: "auth", ipAddress: req.ip, userAgent: req.headers["user-agent"] ?? "", status: "success" })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post("/logout-all", requireAuth, async (req: any, res, next) => {
  try {
    await revokeAllUserTokens(req.user.id)
    await invalidateAllSessions(req.user.id)
    await logAuditEvent({ userId: req.user.id, action: "logout_all", resource: "auth", ipAddress: req.ip, userAgent: req.headers["user-agent"] ?? "", status: "success" })
    res.json({ success: true, message: "All sessions invalidated" })
  } catch (err) { next(err) }
})

export default router
