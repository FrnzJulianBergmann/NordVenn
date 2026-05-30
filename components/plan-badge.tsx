'use client'
import { useWorkspace } from '@/components/workspace-provider'

export default function PlanBadge() {
  const { workspace } = useWorkspace()
  const plan = (workspace as any)?.plan || 'free'
  const isPro = plan === 'pro'
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
      padding: '2px 6px', borderRadius: 4,
      background: isPro ? 'linear-gradient(135deg,#4C6FFF,#7AA2FF)' : 'var(--bg-elevated)',
      color: isPro ? '#fff' : 'var(--text-muted)',
      border: isPro ? 'none' : '1px solid var(--border)',
    }}>
      {isPro ? 'PRO' : 'FREE'}
    </span>
  )
}
