import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. New file: components/action-center.tsx ────────────────────────────────
const actionCenter = `'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Alert = { id: string; priority: 'critical' | 'warning' | 'info'; title: string; sub: string; action: string; href: string }

function buildAlerts(vendors: any[], docs: any[]): Alert[] {
  const now = new Date()
  const in30 = new Date(); in30.setDate(now.getDate() + 30)
  const in7  = new Date(); in7.setDate(now.getDate() + 7)
  const alerts: Alert[] = []

  docs.forEach(d => {
    if (!d.expiry_date) return
    const exp = new Date(d.expiry_date)
    const vendorName = d.vendors?.name || 'Unknown'
    if (exp < now)
      alerts.push({ id: 'exp-' + d.id, priority: 'critical', title: d.name + ' expired', sub: vendorName, action: 'Upload new →', href: '/documents' })
    else if (exp <= in7)
      alerts.push({ id: 'exp7-' + d.id, priority: 'critical', title: d.name + ' expires in ' + Math.ceil((exp.getTime()-now.getTime())/86400000) + ' days', sub: vendorName, action: 'Renew now →', href: '/documents' })
    else if (exp <= in30)
      alerts.push({ id: 'exp30-' + d.id, priority: 'warning', title: d.name + ' expiring soon', sub: vendorName + ' · ' + exp.toLocaleDateString(), action: 'Review →', href: '/documents' })
  })

  vendors.forEach(v => {
    if (v.status === 'pending')
      alerts.push({ id: 'pend-' + v.id, priority: 'warning', title: v.name + ' pending approval', sub: 'Review required', action: 'Review →', href: '/vendors' })
    if (v.required_docs?.length) {
      const uploaded = docs.filter(d => d.vendor_id === v.id).map((d:any) => d.type)
      const missing = v.required_docs.filter((r:string) => !uploaded.includes(r))
      if (missing.length)
        alerts.push({ id: 'miss-' + v.id, priority: 'warning', title: 'Missing ' + missing.join(', '), sub: v.name, action: 'Upload →', href: '/documents' })
    }
  })

  return alerts.sort((a, b) => (a.priority === 'critical' ? -1 : 1))
}

const DOT: Record<string, string> = { critical: '#e8403a', warning: '#e8970a', info: '#5b5ef4' }
const LABEL: Record<string, string> = { critical: 'URGENT', warning: 'WARNING', info: 'INFO' }

export function ActionCenter() {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const router = useRouter()

  const load = useCallback(async () => {
    const [v, d] = await Promise.all([
      supabase.from('vendors').select('*'),
      supabase.from('documents').select('*,vendors(name)'),
    ])
    setAlerts(buildAlerts(v.data || [], d.data || []))
  }, [])

  useEffect(() => { load() }, [load])

  const critical = alerts.filter(a => a.priority === 'critical')
  const warning  = alerts.filter(a => a.priority === 'warning')
  const count    = alerts.length

  const Group = ({ title, items }: { title: string; items: Alert[] }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>{title} ({items.length})</div>
      {items.map(a => (
        <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: DOT[a.priority], marginTop: 5, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.sub}</div>
          </div>
          <button onClick={() => { router.push(a.href); setOpen(false) }} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--accent)', fontSize: 11, padding: '3px 8px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
          }}>{a.action}</button>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Bell button */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => { setOpen(o => !o); if (!open) load() }} style={{
          width: 32, height: 32, borderRadius: 8, background: open ? 'var(--bg-elevated)' : 'none',
          border: '1px solid', borderColor: open ? 'var(--border)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {count > 0 && (
            <div style={{
              position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%',
              background: critical.length > 0 ? '#e8403a' : '#e8970a',
              border: '2px solid var(--bg-surface)',
            }}/>
          )}
        </button>
      </div>

      {/* Slide-over panel */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }}/>
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, zIndex: 99,
            background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.2s ease',
          }}>
            <style>{\`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }\`}</style>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Action Center</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{count === 0 ? 'All clear' : count + ' item' + (count > 1 ? 's' : '') + ' need attention'}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {count === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>All vendors compliant</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>No actions required</div>
                </div>
              )}
              <Group title="Urgent Actions" items={critical} />
              <Group title="Warnings" items={warning} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
`

// ── 2. Patch topbar.tsx — inject ActionCenter between date badge and avatar ──
const topbarPath = resolve('components/topbar.tsx')
let topbar = readFileSync(topbarPath, 'utf8')

// Add import
topbar = topbar.replace(
  `'use client'`,
  `'use client'\nimport { ActionCenter } from '@/components/action-center'`
)

// Inject <ActionCenter /> before the avatar div
topbar = topbar.replace(
  `<div style={{ position: 'relative' }}>`,
  `<ActionCenter />\n\n      <div style={{ position: 'relative' }}>`
)

writeFileSync(topbarPath, topbar, 'utf8')
writeFileSync(resolve('components/action-center.tsx'), actionCenter, 'utf8')
console.log('✅ Action Center created & injected into Topbar!')
