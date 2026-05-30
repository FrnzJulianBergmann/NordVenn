import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

mkdirSync(resolve('app/(dashboard)/upgrade'), { recursive: true })

const content = `'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import Topbar from '@/components/topbar'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/toast'

const CHECK = ({ col }: { col?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col||'#0ea871'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const CROSS = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

const FREE_FEATURES = [
  { label: '1 workspace',             ok: true },
  { label: 'Up to 5 vendors',         ok: true },
  { label: 'Document tracking',       ok: true },
  { label: 'In-app alerts',           ok: true },
  { label: 'Activity log',            ok: true },
  { label: 'Audit export',            ok: false },
  { label: 'Email reminders',         ok: false },
  { label: 'Unlimited vendors',       ok: false },
  { label: 'Unlimited workspaces',    ok: false },
  { label: 'Compliance analytics',    ok: false },
]

const PRO_FEATURES = [
  { label: 'Unlimited workspaces',    ok: true },
  { label: 'Unlimited vendors',       ok: true },
  { label: 'Document tracking',       ok: true },
  { label: 'In-app alerts',           ok: true },
  { label: 'Activity log',            ok: true },
  { label: 'Audit export',            ok: true },
  { label: 'Email reminders',         ok: true },
  { label: 'Compliance analytics',    ok: true },
  { label: 'Action Center',           ok: true },
  { label: 'Priority support',        ok: true },
]

export default function UpgradePage() {
  const { workspace, refresh } = useWorkspace()
  const plan = (workspace as any)?.plan || 'free'
  const isPro = plan === 'pro'
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const activate = async (p: 'free' | 'pro') => {
    if (!workspace) return
    setLoading(true)
    await supabase.from('workspaces').update({ plan: p }).eq('id', workspace.id)
    await refresh()
    toast.success(p === 'pro' ? '✨ Pro activated!' : 'Switched to Free')
    setLoading(false)
    router.push('/')
  }

  return (
    <>
      <Topbar title="Plans & Pricing" subtitle="Choose the plan that fits your team." />
      <div style={{ padding: '32px 20px 48px', maxWidth: 820, margin: '0 auto' }}>

        {/* Current plan banner */}
        <div style={{
          background: isPro ? 'linear-gradient(135deg,#1a1f3a,#0f1628)' : 'var(--bg-surface)',
          border: \`1px solid \${isPro ? '#4C6FFF40' : 'var(--border-subtle)'}\`,
          borderRadius: 10, padding: '14px 20px', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Current plan:</div>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 5,
              background: isPro ? 'linear-gradient(135deg,#4C6FFF,#7AA2FF)' : 'var(--bg-elevated)',
              color: isPro ? '#fff' : 'var(--text-muted)',
              border: isPro ? 'none' : '1px solid var(--border)',
            }}>{isPro ? 'PRO' : 'FREE'}</span>
            {isPro && <span style={{ fontSize: 12, color: '#7AA2FF' }}>· All features unlocked</span>}
          </div>
          {isPro && (
            <button onClick={() => activate('free')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Free */}
          <div style={{
            background: 'var(--bg-surface)', border: \`1px solid \${!isPro ? '#4C6FFF60' : 'var(--border-subtle)'}\`,
            borderRadius: 12, overflow: 'hidden',
            boxShadow: !isPro ? '0 0 0 1px #4C6FFF20' : 'none',
          }}>
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>$0</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/month</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Get started with vendor compliance basics.
              </div>
              <button
                onClick={() => !isPro ? null : activate('free')}
                disabled={!isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPro ? 'pointer' : 'default',
                  background: !isPro ? 'var(--bg-elevated)' : 'none',
                  border: \`1px solid \${!isPro ? 'var(--accent)' : 'var(--border)'}\`,
                  color: !isPro ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {!isPro ? '✓ Current plan' : 'Downgrade'}
              </button>
            </div>
            <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Includes</div>
              {FREE_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {f.ok ? <CHECK/> : <CROSS/>}
                  <span style={{ fontSize: 13, color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{
            background: 'linear-gradient(180deg,#13182e 0%,#0f1220 100%)',
            border: \`1px solid \${isPro ? '#4C6FFF60' : '#4C6FFF30'}\`,
            borderRadius: 12, overflow: 'hidden', position: 'relative',
            boxShadow: isPro ? '0 0 0 1px #4C6FFF20, 0 8px 32px #4C6FFF18' : '0 4px 16px #4C6FFF10',
          }}>
            {/* Popular badge */}
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
              RECOMMENDED
            </div>
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7AA2FF', marginBottom: 8 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#E6E8EC', letterSpacing: '-1px' }}>$19</span>
                <span style={{ fontSize: 13, color: '#7a8599' }}>/month</span>
              </div>
              <div style={{ fontSize: 12, color: '#7a8599', marginBottom: 20, lineHeight: 1.6 }}>
                Everything you need for serious vendor compliance.
              </div>
              <button
                onClick={() => isPro ? null : activate('pro')}
                disabled={isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: isPro ? 'default' : 'pointer',
                  background: isPro ? '#4C6FFF22' : 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
                  border: isPro ? '1px solid #4C6FFF40' : 'none',
                  color: '#fff',
                  boxShadow: isPro ? 'none' : '0 4px 16px #4C6FFF50',
                  opacity: loading ? 0.7 : 1,
                }}>
                {isPro ? '✓ Current plan' : loading ? 'Activating...' : 'Upgrade to Pro →'}
              </button>
            </div>
            <div style={{ padding: '0 24px 24px', borderTop: '1px solid #4C6FFF20', paddingTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#455065', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Everything in Free, plus</div>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <CHECK col="#4C6FFF"/>
                  <span style={{ fontSize: 13, color: '#c0c8d8' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          No credit card required during beta · Cancel anytime
        </div>
      </div>
    </>
  )
}
`

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), content, 'utf8')
console.log('✅ Part 1 done — Upgrade page created at /upgrade')
