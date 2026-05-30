'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import Topbar from '@/components/topbar'
import { toast } from '@/components/toast'

const COUNTRIES = [
  {code:'US',dial:'+1',flag:'🇺🇸'},{code:'GB',dial:'+44',flag:'🇬🇧'},
  {code:'ID',dial:'+62',flag:'🇮🇩'},{code:'SG',dial:'+65',flag:'🇸🇬'},
  {code:'AU',dial:'+61',flag:'🇦🇺'},{code:'CA',dial:'+1',flag:'🇨🇦'},
  {code:'DE',dial:'+49',flag:'🇩🇪'},{code:'FR',dial:'+33',flag:'🇫🇷'},
  {code:'JP',dial:'+81',flag:'🇯🇵'},{code:'IN',dial:'+91',flag:'🇮🇳'},
  {code:'BR',dial:'+55',flag:'🇧🇷'},{code:'MX',dial:'+52',flag:'🇲🇽'},
  {code:'AE',dial:'+971',flag:'🇦🇪'},{code:'SA',dial:'+966',flag:'🇸🇦'},
  {code:'MY',dial:'+60',flag:'🇲🇾'},{code:'PH',dial:'+63',flag:'🇵🇭'},
  {code:'NL',dial:'+31',flag:'🇳🇱'},{code:'IT',dial:'+39',flag:'🇮🇹'},
  {code:'ES',dial:'+34',flag:'🇪🇸'},{code:'KR',dial:'+82',flag:'🇰🇷'},
]

const PhoneInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const parse = (v: string) => {
    const found = COUNTRIES.find(c => v.startsWith(c.dial + ' '))
    if (found) return { num: v.slice(found.dial.length + 1), country: found }
    return { num: v.replace(/^\+\d+ ?/, ''), country: COUNTRIES[0] }
  }
  const { num, country } = parse(value)
  const [open, setOpen] = React.useState(false)
  const [sel, setSel] = React.useState(country)
  const ref = React.useRef<HTMLDivElement>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 })

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  React.useEffect(() => {
    const found = COUNTRIES.find(c => value.startsWith(c.dial + ' '))
    if (found) setSel(found)
  }, [value])

  const selectCountry = (c: typeof COUNTRIES[0]) => { setSel(c); setOpen(false); onChange(c.dial + ' ' + num) }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
      <button type="button" ref={btnRef} onClick={() => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect()
          setDropPos({ top: r.bottom + 4, left: r.left, width: r.width + 200 })
        }
        setOpen(o => !o)
      }} style={{
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRight: 'none', borderRadius: '6px 0 0 6px',
        padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13,
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{sel.flag}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 30 }}>{sel.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <input type="tel" value={num} onChange={e => onChange(sel.dial + ' ' + e.target.value)}
        placeholder="812 3456 7890"
        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 0', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', minWidth: 0 }}
      />
      {open && (
        <div style={{
          position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight: 220, overflowY: 'auto', minWidth: 210,
        }}>
          {COUNTRIES.map(c => (
            <button key={c.code} type="button" onClick={() => selectCountry(c)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 12px', background: sel.code === c.code ? 'var(--bg-elevated)' : 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ color: 'var(--text-muted)', width: 36, flexShrink: 0 }}>{c.dial}</span>
              <span>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: 16 }}>
    <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
    </div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
    {children}
  </div>
)

const inp = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' } as React.CSSProperties

const Toggle = ({ on, onChange, label, sub }: { on: boolean; onChange: () => void; label: string; sub?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
    <div onClick={onChange} style={{
      width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
      background: on ? 'var(--accent)' : 'var(--bg-elevated)',
      border: '1px solid', borderColor: on ? 'var(--accent)' : 'var(--border)',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }}/>
    </div>
  </div>
)

const TABS = ['Profile', 'Notifications', 'Workspace', 'Security']

export default function SettingsPage() {
  const { workspace, refresh } = useWorkspace()
  const plan = (workspace as any)?.plan || 'free'
  const isPro = plan === 'pro'

  const [tab, setTab] = useState('Profile')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [notifs, setNotifs] = useState({ expiring_docs: true, vendor_approvals: true, critical_alerts: true, weekly_summary: false, channel_email: true, channel_inapp: true })
  const [wsName, setWsName] = useState('')
  const [passwords, setPasswords] = useState({ next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        setProfile({ email: data.user.email || '', full_name: data.user.user_metadata?.full_name || '', phone: data.user.user_metadata?.phone || '' })
      }
    })
  }, [])

  useEffect(() => { if (workspace) setWsName(workspace.name) }, [workspace])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: profile.full_name, phone: profile.phone } })
    toast.success('Profile saved')
    setSaving(false)
  }

  const saveWorkspace = async () => {
    if (!workspace || !wsName.trim()) return
    setSaving(true)
    const { error } = await supabase.from('workspaces').update({ name: wsName.trim() }).eq('id', workspace.id)
    if (error) toast.error(error.message)
    else { toast.success('Workspace updated'); refresh() }
    setSaving(false)
  }

  const savePassword = async () => {
    if (!passwords.next || passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.next.length < 8) { toast.error('Min. 8 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.next })
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setPasswords({ next: '', confirm: '' }) }
    setSaving(false)
  }

  const switchPlan = async (p: string) => {
    if (!workspace) return
    await supabase.from('workspaces').update({ plan: p }).eq('id', workspace.id)
    await refresh()
    toast.success(p === 'pro' ? 'Switched to Pro ✨' : 'Switched to Free')
  }

  const Btn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
      {saving ? 'Saving...' : label}
    </button>
  )

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account and workspace preferences." />
      <div style={{ padding: '16px 20px 28px', maxWidth: 640 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: tab === t ? 'var(--bg-surface)' : 'none',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}>{t}</button>
          ))}
        </div>

        {/* ── Profile ── */}
        {tab === 'Profile' && (
          <Section title="Profile">
            <Field label="Full Name">
              <input style={inp} value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <input style={{ ...inp, opacity: 0.6 }} value={profile.email} disabled />
            </Field>
            <Field label="Phone">
              <PhoneInput value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Btn onClick={saveProfile} label="Save Profile" /></div>
          </Section>
        )}

        {/* ── Notifications ── */}
        {tab === 'Notifications' && (
          <>
            <Section title="Alert Preferences">
              <Toggle on={notifs.expiring_docs} onChange={() => setNotifs(p => ({ ...p, expiring_docs: !p.expiring_docs }))} label="Expiring Documents" sub="Notify when documents expire within 30 days" />
              <Toggle on={notifs.vendor_approvals} onChange={() => setNotifs(p => ({ ...p, vendor_approvals: !p.vendor_approvals }))} label="Vendor Approvals" sub="Notify when a vendor is pending review" />
              <Toggle on={notifs.critical_alerts} onChange={() => setNotifs(p => ({ ...p, critical_alerts: !p.critical_alerts }))} label="Critical Alerts" sub="Expired docs, missing required documents" />
              <div style={{ borderBottom: 'none' }}>
                <Toggle on={notifs.weekly_summary} onChange={() => setNotifs(p => ({ ...p, weekly_summary: !p.weekly_summary }))} label="Weekly Compliance Digest" sub="Summary email every Monday morning" />
              </div>
            </Section>
            <Section title="Channels">
              <Toggle on={notifs.channel_email} onChange={() => setNotifs(p => ({ ...p, channel_email: !p.channel_email }))} label="Email" sub="Receive alerts via email" />
              <div style={{ borderBottom: 'none' }}>
                <Toggle on={notifs.channel_inapp} onChange={() => setNotifs(p => ({ ...p, channel_inapp: !p.channel_inapp }))} label="In-app" sub="Show alerts in the Action Center" />
              </div>
            </Section>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn onClick={() => toast.success('Preferences saved')} label="Save Preferences" /></div>
          </>
        )}

        {/* ── Workspace ── */}
        {tab === 'Workspace' && (
          <>
            <Section title="Workspace Settings">
              <Field label="Workspace Name">
                <input style={inp} value={wsName} onChange={e => setWsName(e.target.value)} placeholder="My Workspace" />
              </Field>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Btn onClick={saveWorkspace} label="Save Workspace" /></div>
            </Section>
          </>
        )}

        {/* ── Security ── */}
        {tab === 'Security' && (
          <>
            <Section title="Change Password">
              <Field label="New Password">
                <input type="password" style={inp} value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" />
              </Field>
              <Field label="Confirm Password">
                <input type="password" style={inp} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" />
              </Field>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Btn onClick={savePassword} label="Update Password" /></div>
            </Section>
            <Section title="Active Session">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Current session</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{user?.email} · {new Date().toLocaleDateString()}</div>
                </div>
                <span style={{ background: '#0ea87118', color: '#0ea871', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>ACTIVE</span>
              </div>
            </Section>
          </>
        )}
      </div>
    </>
  )
}
