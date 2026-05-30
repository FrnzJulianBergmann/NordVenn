import { writeFileSync } from 'fs'
import { resolve } from 'path'

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
  { label: '1 workspace',          ok: true },
  { label: 'Up to 5 vendors',      ok: true },
  { label: 'Document tracking',    ok: true },
  { label: 'In-app alerts',        ok: true },
  { label: 'Activity log',         ok: true },
  { label: 'Audit export',         ok: false },
  { label: 'Email reminders',      ok: false },
  { label: 'Unlimited vendors',    ok: false },
  { label: 'Unlimited workspaces', ok: false },
  { label: 'Compliance analytics', ok: false },
]

const PRO_FEATURES = [
  { label: 'Unlimited workspaces'    },
  { label: 'Unlimited vendors'       },
  { label: 'Document tracking'       },
  { label: 'In-app alerts'           },
  { label: 'Activity log'            },
  { label: 'Audit export'            },
  { label: 'Email reminders'         },
  { label: 'Compliance analytics'    },
  { label: 'Action Center'           },
  { label: 'Priority support'        },
]

const TRUST_ITEMS = [
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',                              label: 'SOC 2 Ready' },
  { icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',                  label: 'Audit-grade exports' },
  { icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z', label: 'Built for procurement' },
  { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2', label: 'Real-time compliance' },
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
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Current plan:</div>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 5,
            background: isPro ? 'linear-gradient(135deg,#4C6FFF,#7AA2FF)' : 'var(--bg-elevated)',
            color: isPro ? '#fff' : 'var(--text-muted)',
            border: isPro ? 'none' : '1px solid var(--border)',
          }}>{isPro ? 'PRO' : 'FREE'}</span>
          {isPro && <span style={{ fontSize: 12, color: '#7AA2FF' }}>· All features unlocked</span>}
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.08fr', gap: 16, alignItems: 'start' }}>

          {/* ── Free ── */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12, overflow: 'hidden',
            opacity: isPro ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>Free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>$0</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/month</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Perfect for small teams getting started with vendor management.
              </div>
              <button
                onClick={() => isPro ? activate('free') : undefined}
                disabled={!isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: isPro ? 'pointer' : 'default',
                  background: 'none',
                  border: '1px solid var(--border)',
                  color: !isPro ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {!isPro ? '✓ Current plan' : 'Switch to Free'}
              </button>
            </div>
            <div style={{ padding: '20px 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>What you get</div>
              {FREE_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {f.ok ? <CHECK/> : <CROSS/>}
                  <span style={{ fontSize: 13, color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pro ── */}
          <div style={{
            background: 'linear-gradient(180deg,#13182e 0%,#0f1220 100%)',
            border: '1px solid #4C6FFF50',
            borderRadius: 12, overflow: 'hidden', position: 'relative',
            boxShadow: isPro
              ? '0 0 0 1px #4C6FFF30, 0 16px 48px #4C6FFF25, 0 4px 16px rgba(0,0,0,0.4)'
              : '0 0 0 1px #4C6FFF20, 0 12px 40px #4C6FFF20, 0 4px 16px rgba(0,0,0,0.3)',
            transform: 'translateY(-4px)',
          }}>
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '4px 12px', borderRadius: 20, letterSpacing: '0.06em',
              boxShadow: '0 2px 12px #4C6FFF60',
            }}>✦ RECOMMENDED</div>

            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7AA2FF', marginBottom: 8 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#E6E8EC', letterSpacing: '-2px' }}>$19</span>
                <span style={{ fontSize: 13, color: '#7a8599' }}>/month</span>
              </div>
              <div style={{ fontSize: 12, color: '#7a8599', marginBottom: 20, lineHeight: 1.6 }}>
                Built for teams managing vendor risk at scale.
              </div>
              <button
                onClick={() => !isPro ? activate('pro') : undefined}
                disabled={isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: isPro ? 'default' : 'pointer',
                  background: isPro ? '#4C6FFF22' : 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
                  border: isPro ? '1px solid #4C6FFF40' : 'none',
                  color: '#fff',
                  boxShadow: isPro ? 'none' : '0 4px 20px #4C6FFF60, 0 2px 8px #4C6FFF40',
                  opacity: loading ? 0.7 : 1,
                }}>
                {isPro ? '✓ Current plan' : loading ? 'Activating...' : 'Upgrade to Pro →'}
              </button>
            </div>

            <div style={{ padding: '20px 24px 24px', borderTop: '1px solid #4C6FFF20' }}>
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

        {/* Social trust */}
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Trusted by operations-focused startups &amp; compliance teams
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 10,
          maxWidth: 500, margin: '0 auto', flexWrap: 'wrap',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>No credit card required</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Cancel anytime</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Data stays yours</span>
        </div>

      </div>
    </>
  )
}
`

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), content, 'utf8')
console.log('✅ Upgrade page fully rewritten — clean!')
