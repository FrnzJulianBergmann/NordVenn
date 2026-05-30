import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. lib/plan.ts — plan config & limits ───────────────────────────────────
const planLib = `export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    limits: { vendors: 5 },
    features: {
      audit_export: false,
      advanced_analytics: false,
      full_notifications: false,
      unlimited_vendors: false,
    },
  },
  pro: {
    label: 'Pro',
    price: 19,
    limits: { vendors: Infinity },
    features: {
      audit_export: true,
      advanced_analytics: true,
      full_notifications: true,
      unlimited_vendors: true,
    },
  },
} as const

export type Plan = keyof typeof PLANS

export function getPlanFeatures(plan: string) {
  return PLANS[(plan as Plan) || 'free'] ?? PLANS.free
}
`
writeFileSync(resolve('lib/plan.ts'), planLib, 'utf8')

// ── 2. components/upgrade-modal.tsx ─────────────────────────────────────────
const upgradeModal = `'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'

type Props = { open: boolean; onClose: () => void; reason?: string }

export default function UpgradeModal({ open, onClose, reason }: Props) {
  const { workspace, refresh } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [upgraded, setUpgraded] = useState(false)

  if (!open) return null

  const upgrade = async () => {
    if (!workspace) return
    setLoading(true)
    await supabase.from('workspaces').update({ plan: 'pro' }).eq('id', workspace.id)
    await refresh()
    setUpgraded(true)
    setLoading(false)
    setTimeout(() => { setUpgraded(false); onClose() }, 1500)
  }

  const features = [
    { icon: '◈', label: 'Unlimited vendors', sub: 'Free tier limited to 5' },
    { icon: '↓', label: 'Audit Export', sub: 'Generate compliance reports' },
    { icon: '◷', label: 'Full notifications', sub: 'Email + in-app alerts' },
    { icon: '⊞', label: 'Compliance analytics', sub: 'Advanced health scoring' },
  ]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 300 }}/>
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 440, zIndex: 301,
        background: 'var(--bg-surface)', border: '1px solid #4C6FFF40',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px #4C6FFF20',
        animation: 'modalIn 0.2s ease',
      }}>
        <style>{\`@keyframes modalIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}\`}</style>

        {/* Header gradient */}
        <div style={{ background: 'linear-gradient(135deg,#1a1f3a,#0f1628)', padding: '28px 28px 24px', borderBottom: '1px solid #4C6FFF20' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>PRO</div>
            <div style={{ fontSize: 11, color: '#7AA2FF', fontWeight: 500 }}>$19 / month</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E6E8EC', letterSpacing: '-0.4px', marginBottom: 6 }}>Upgrade to NordVenn Pro</div>
          {reason && <div style={{ fontSize: 12, color: '#7a8599', background: '#e8403a12', border: '1px solid #e8403a25', borderRadius: 6, padding: '6px 10px', marginTop: 8 }}>⚠ {reason}</div>}
        </div>

        {/* Features */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 14 }}>Everything in Pro</div>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: '#4C6FFF18', border: '1px solid #4C6FFF30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#4C6FFF', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.sub}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2.5" style={{ marginLeft: 'auto', flexShrink: 0 }}><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '0 28px 28px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: '11px', fontSize: 13, cursor: 'pointer' }}>Maybe later</button>
          <button onClick={upgrade} disabled={loading || upgraded} style={{
            flex: 2, background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: loading ? 0.8 : 1, boxShadow: '0 4px 16px #4C6FFF40',
          }}>
            {upgraded ? '✓ Upgraded!' : loading ? 'Upgrading...' : 'Upgrade to Pro — $19/mo'}
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '0 28px 20px' }}>
          Test mode — no payment required yet
        </div>
      </div>
    </>
  )
}
`
writeFileSync(resolve('components/upgrade-modal.tsx'), upgradeModal, 'utf8')

// ── 3. components/plan-badge.tsx — reusable badge ───────────────────────────
const planBadge = `'use client'
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
`
writeFileSync(resolve('components/plan-badge.tsx'), planBadge, 'utf8')

// ── 4. Patch workspace-provider — include plan in workspace type ─────────────
const providerPath = resolve('components/workspace-provider.tsx')
let provider = readFileSync(providerPath, 'utf8')
provider = provider.replace(
  `type WS = { id: string; name: string; owner_id: string }`,
  `type WS = { id: string; name: string; owner_id: string; plan: string }`
)
writeFileSync(providerPath, provider, 'utf8')

// ── 5. Patch settings — add plan switcher tab content ───────────────────────
const settingsPath = resolve('app/(dashboard)/settings/page.tsx')
let settings = readFileSync(settingsPath, 'utf8')

// Add imports
settings = settings.replace(
  `import { useWorkspace } from '@/components/workspace-provider'`,
  `import { useWorkspace } from '@/components/workspace-provider'
import { supabase as sb } from '@/lib/supabase'`
)

// Add plan switcher in Workspace tab after workspace name save button
settings = settings.replace(
  `            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Btn onClick={saveWorkspace} label="Save Workspace" /></div>
          </Section>`,
  `            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Btn onClick={saveWorkspace} label="Save Workspace" /></div>
          </Section>
          <Section title="Plan — Dev Mode">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Current Plan</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Switch to test free/pro flows</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5,
                background: (workspace as any)?.plan === 'pro' ? 'linear-gradient(135deg,#4C6FFF,#7AA2FF)' : 'var(--bg-elevated)',
                color: (workspace as any)?.plan === 'pro' ? '#fff' : 'var(--text-muted)',
                border: (workspace as any)?.plan === 'pro' ? 'none' : '1px solid var(--border)',
              }}>{((workspace as any)?.plan || 'free').toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={async () => {
                if (!workspace) return
                await sb.from('workspaces').update({ plan: 'free' }).eq('id', workspace.id)
                refresh(); toast.success('Switched to Free')
              }} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid var(--border)', background: (workspace as any)?.plan === 'free' ? 'var(--bg-elevated)' : 'none', color: (workspace as any)?.plan === 'free' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                Free
              </button>
              <button onClick={async () => {
                if (!workspace) return
                await sb.from('workspaces').update({ plan: 'pro' }).eq('id', workspace.id)
                refresh(); toast.success('Switched to Pro ✨')
              }} style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: (workspace as any)?.plan === 'pro' ? 'linear-gradient(135deg,#4C6FFF,#7AA2FF)' : 'var(--bg-elevated)', color: (workspace as any)?.plan === 'pro' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, boxShadow: (workspace as any)?.plan === 'pro' ? '0 2px 8px #4C6FFF40' : 'none' }}>
                Pro ✨
              </button>
            </div>
          </Section>`
)

// Fix duplicate import
settings = settings.replace(`import { supabase as sb } from '@/lib/supabase'\n`, '')
settings = settings.replace(
  `import { supabase } from '@/lib/supabase'`,
  `import { supabase } from '@/lib/supabase'\nimport { supabase as sb } from '@/lib/supabase'`
)
// Actually just use supabase directly - remove sb
settings = settings.replace(`import { supabase as sb } from '@/lib/supabase'\n`, '')
settings = settings.replace(/sb\./g, 'supabase.')

writeFileSync(settingsPath, settings, 'utf8')

console.log('✅ Subscription system scaffolded!')
console.log('   · lib/plan.ts — plan config & limits')
console.log('   · components/upgrade-modal.tsx — upgrade modal UI')
console.log('   · components/plan-badge.tsx — reusable badge')
console.log('   · workspace-provider — plan included in WS type')
console.log('   · settings — plan switcher (dev mode)')
