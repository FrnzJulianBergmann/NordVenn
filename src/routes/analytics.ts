import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { getRealtimeMetrics } from "../services/analyticsService"
import { supabaseAdmin } from "../db/supabaseClient"

const router = Router()
router.use(requireAuth)

router.get("/:repoId/metrics", async (req: any, res, next) => {
  try {
    const metrics = await getRealtimeMetrics(req.params.repoId)
    res.json(metrics)
  } catch (err) { next(err) }
})

router.get("/:repoId/activity", async (req: any, res, next) => {
  try {
    const { data } = await supabaseAdmin
      .from("activity_events")
      .select("*")
      .eq("repo_id", req.params.repoId)
      .order("timestamp", { ascending: false })
      .limit(50)
    res.json({ data: data ?? [] })
  } catch (err) { next(err) }
})

router.get("/:repoId/trend", async (req: any, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 7
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const { data } = await supabaseAdmin
      .from("pull_requests")
      .select("created_at, impact_score, risk_level")
      .eq("repo_id", req.params.repoId)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
    res.json({ data: data ?? [], days })
  } catch (err) { next(err) }
})

export default router
