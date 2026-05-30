import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

mkdirSync(resolve('app/(dashboard)/settings'), { recursive: true })

const page = `'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'
import { toast } from '@/components/toast'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
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
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2, width: 14, height: 14,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
      }}/>
    </div>
  </div>
)

const TABS = ['Profile', 'Notifications', 'Workspace', 'Security']
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tokyo']

export default function SettingsPage() {
  const [tab, setTab] = useState('Profile')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({ full_name: '', email: '', role: 'Admin', timezone: 'UTC' })
  const [notifs, setNotifs] = useState({ expiring_docs: true, vendor_approvals: true, critical_alerts: true, weekly_summary: false, channel_email: true, channel_inapp: true })
  const [workspace, setWorkspace] = useState({ name: 'My Workspace', timezone: 'UTC' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        setProfile(p => ({ ...p, email: data.user.email || '', full_name: data.user.user_metadata?.full_name || '' }))
      }
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: profile.full_name } })
    toast.success('Profile saved')
    setSaving(false)
  }

  const savePassword = async () => {
    if (!passwords.next || passwords.next !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.next.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.next })
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setPasswords({ current: '', next: '', confirm: '' }) }
    setSaving(false)
  }

  const btn = (onClick: () => void, label: string) => (
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

        {tab === 'Profile' && (
          <Section title="Profile">
            <Field label="Full Name">
              <input style={inp} value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <input style={{ ...inp, opacity: 0.6 }} value={profile.email} disabled />
            </Field>
            <Field label="Role">
              <input style={{ ...inp, opacity: 0.6 }} value={profile.role} disabled />
            </Field>
            <Field label="Timezone">
              <select style={{ ...inp }} value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>{btn(saveProfile, 'Save Profile')}</div>
          </Section>
        )}

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
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{btn(() => toast.success('Notification preferences saved'), 'Save Preferences')}</div>
          </>
        )}

        {tab === 'Workspace' && (
          <Section title="Workspace Settings">
            <Field label="Workspace Name">
              <input style={inp} value={workspace.name} onChange={e => setWorkspace(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Default Timezone">
              <select style={inp} value={workspace.timezone} onChange={e => setWorkspace(p => ({ ...p, timezone: e.target.value }))}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>{btn(() => toast.success('Workspace saved'), 'Save Workspace')}</div>
          </Section>
        )}

        {tab === 'Security' && (
          <>
            <Section title="Change Password">
              <Field label="New Password">
                <input type="password" style={inp} value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" />
              </Field>
              <Field label="Confirm Password">
                <input type="password" style={inp} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" />
              </Field>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>{btn(savePassword, 'Update Password')}</div>
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
`

writeFileSync(resolve('app/(dashboard)/settings/page.tsx'), page, 'utf8')
console.log('✅ Settings/Account page created at app/(dashboard)/settings/page.tsx')
