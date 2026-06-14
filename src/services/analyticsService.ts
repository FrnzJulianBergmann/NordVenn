import { supabaseAdmin } from "../db/supabaseClient"

export interface RealtimeMetrics {
  repoId: string
  openPRs: number
  riskScore: number
  activeIncidents: number
  recentActivity: ActivityEvent[]
  timestamp: string
}

export interface ActivityEvent {
  type: "pr_opened" | "pr_merged" | "incident_created" | "sync_completed"
  message: string
  timestamp: string
}

export async function getRealtimeMetrics(repoId: string): Promise<RealtimeMetrics> {
  const [{ count: openPRs }, { data: repo }, { count: activeIncidents }] = await Promise.all([
    supabaseAdmin.from("pull_requests").select("id", { count: "exact", head: true }).eq("repo_id", repoId).eq("status", "open"),
    supabaseAdmin.from("repositories").select("exposure_score").eq("id", repoId).single(),
    supabaseAdmin.from("incidents").select("id", { count: "exact", head: true }).eq("repo_id", repoId).eq("status", "open"),
  ])

  return {
    repoId,
    openPRs: openPRs ?? 0,
    riskScore: repo?.exposure_score ?? 0,
    activeIncidents: activeIncidents ?? 0,
    recentActivity: [],
    timestamp: new Date().toISOString(),
  }
}

export async function trackActivity(repoId: string, event: ActivityEvent) {
  await supabaseAdmin.from("activity_events").insert({ repo_id: repoId, ...event })
}
