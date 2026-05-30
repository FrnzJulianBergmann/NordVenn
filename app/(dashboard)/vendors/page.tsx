'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import { toast } from '@/components/toast'
import { TableSkeleton } from '@/components/skeleton'
import Topbar from '@/components/topbar'
import { AuditExportButton } from '@/components/audit-export'
import UpgradeModal from '@/components/upgrade-modal'
import { useConfirm } from '@/components/confirm-dialog'

const FREE_VENDOR_LIMIT = 5

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
    if (found) return { dial: found.dial, num: v.slice(found.dial.length + 1), country: found }
    return { dial: '+1', num: v.replace(/^\+1 ?/, ''), country: COUNTRIES[0] }
  }
  const { dial, num, country } = parse(value)
  const [open, setOpen] = React.useState(false)
  const [sel, setSel] = React.useState(country)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const selectCountry = (c: typeof COUNTRIES[0]) => { setSel(c); setOpen(false); onChange(c.dial + ' ' + num) }
  const handleNum = (e: React.ChangeEvent<HTMLInputElement>) => onChange(sel.dial + ' ' + e.target.value)
  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', gap: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{sel.flag}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sel.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <input type="tel" value={num} onChange={handleNum} placeholder="(555) 123-4567"
        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 0', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', minWidth: 0 }} />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxHeight: 220, overflowY: 'auto', minWidth: 200 }}>
          {COUNTRIES.map(c => (
            <button key={c.code} type="button" onClick={() => selectCountry(c)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: sel.code === c.code ? 'var(--bg-elevated)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12, textAlign: 'left' }}>
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

const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract']

const Badge = ({ s }: { s: string }) => {
  const map: any = { active:['#0ea871','#0ea87118'], pending:['#e8970a','#e8970a18'], inactive:['#44445a','#44445a18'], incomplete:['#e8403a','#e8403a18'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</span>
}

// Gated Audit Export Button
const GatedAuditButton = ({ vendor, isPro, onUpgrade }: { vendor: any; isPro: boolean; onUpgrade: () => void }) => {
  if (isPro) return <AuditExportButton vendor={vendor} />
  return (
    <button onClick={onUpgrade} style={{ background: 'none', border: '1px solid #4C6FFF33', color: '#7AA2FF', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Export
    </button>
  )
}

export default function VendorsPage() {
  const { workspace } = useWorkspace()
  const plan = (workspace as any)?.plan || 'free'
  const isPro = plan === 'pro'

  const [vendors, setVendors] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: '', status: 'active', required_docs: [] as string[] })
  const [saving, setSaving] = useState(false)
  const { confirm } = useConfirm()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')

  const load = async () => {
    if (!workspace) return
    setLoading(true)
    const [v, d] = await Promise.all([
      supabase.from('vendors').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
      supabase.from('documents').select('vendor_id,type').eq('workspace_id', workspace.id)
    ])
    setVendors(v.data || []); setDocs(d.data || []); setLoading(false)
  }

  useEffect(() => { load() }, [workspace])

  const getMissing = (v: any) => {
    if (!v.required_docs?.length) return []
    const uploaded = docs.filter(d => d.vendor_id === v.id).map(d => d.type)
    return v.required_docs.filter((r: string) => !uploaded.includes(r))
  }

  const filtered = vendors.filter(v => {
    const matchQ = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.category?.toLowerCase().includes(search.toLowerCase())
    const missing = getMissing(v)
    const matchF = filter === 'all' || v.status === filter || (filter === 'incomplete' && missing.length > 0)
    return matchQ && matchF
  })

  const isOverLimit = !isPro && vendors.length >= FREE_VENDOR_LIMIT

  const openAdd = () => {
    if (isOverLimit) {
      setUpgradeReason(`Free plan is limited to ${FREE_VENDOR_LIMIT} vendors. Upgrade to Pro for unlimited vendors.`)
      setUpgradeOpen(true)
      return
    }
    setEditing(null); setForm({ name: '', email: '', phone: '', category: '', status: 'active', required_docs: [] }); setOpen(true)
  }

  const openEdit = (v: any) => { setEditing(v); setForm({ name: v.name, email: v.email || '', phone: v.phone || '', category: v.category || '', status: v.status, required_docs: v.required_docs || [] }); setOpen(true) }
  const toggleDoc = (t: string) => setForm(p => ({ ...p, required_docs: p.required_docs.includes(t) ? p.required_docs.filter(x => x !== t) : [...p.required_docs, t] }))

  const save = async () => {
    if (!form.name.trim() || !workspace) return
    setSaving(true)
    if (editing) {
      await supabase.from('vendors').update(form).eq('id', editing.id)
      await supabase.from('activity_logs').insert({ action: 'Vendor updated', description: form.name, workspace_id: workspace.id })
      toast.success('Vendor updated')
    } else {
      await supabase.from('vendors').insert({ ...form, workspace_id: workspace.id })
      await supabase.from('activity_logs').insert({ action: 'Vendor added', description: form.name, workspace_id: workspace.id })
      toast.success('Vendor added')
    }
    setSaving(false); setOpen(false); load()
  }

  const del = async (id: string, name: string) => {
    const ok = await confirm({ title: 'Delete Vendor', message: `Are you sure you want to delete "${name}"? This action cannot be undone.`, danger: true, confirmLabel: 'Delete Vendor' })
    if (!ok || !workspace) return
    await supabase.from('vendors').delete().eq('id', id)
    await supabase.from('activity_logs').insert({ action: 'Vendor deleted', description: name, workspace_id: workspace.id })
    toast.error('Vendor deleted'); load()
  }

  const inp = (label: string, key: string, type = 'text') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
    </div>
  )

  return (
    <>
      <Topbar title="Vendors" subtitle="Manage your vendor list." />
      <div style={{ padding: '16px 20px 28px' }}>

        {/* Over-limit warning */}
        {isOverLimit && (
          <div style={{ background: '#e8970a12', border: '1px solid #e8970a33', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', flexShrink: 0 }}/>
              <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 500 }}>
                Free plan limit reached — {vendors.length}/{FREE_VENDOR_LIMIT} vendors. Existing vendors are read-only.
              </span>
            </div>
            <button onClick={() => { setUpgradeReason('Upgrade to Pro for unlimited vendors.'); setUpgradeOpen(true) }}
              style={{ background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              Upgrade to Pro
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 12px', flex: 1, maxWidth: 280 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'active', 'pending', 'incomplete', 'inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'var(--bg-elevated)' : 'none', border: '1px solid',
                borderColor: filter === f ? 'var(--border)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize'
              }}>{f}</button>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          {!isPro && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {vendors.length}/{FREE_VENDOR_LIMIT} vendors
            </span>
          )}
          <button onClick={openAdd} style={{
            background: isOverLimit ? 'var(--bg-elevated)' : 'var(--accent)',
            color: isOverLimit ? 'var(--text-muted)' : '#fff',
            border: isOverLimit ? '1px solid var(--border)' : 'none',
            borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {isOverLimit && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            + Add Vendor
          </button>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Vendor Name', 'Category', 'Status', 'Required Docs', 'Missing', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeleton rows={5} cols={6} />}
              {!loading && !filtered.length && <tr><td colSpan={6} style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center' }}>No vendors found.</td></tr>}
              {filtered.map((v, i) => {
                const missing = getMissing(v)
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{v.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-secondary)', fontSize: 12 }}>{v.category || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>{missing.length > 0 ? <Badge s="incomplete" /> : <Badge s={v.status} />}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 11 }}>{v.required_docs?.length ? v.required_docs.join(', ') : '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: missing.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{missing.length > 0 ? missing.join(', ') : v.required_docs?.length ? 'Complete' : '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => openEdit(v)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, marginRight: 6 }}>Edit</button>
                      <button onClick={() => del(v.id, v.name)} style={{ background: 'none', border: '1px solid #e8403a33', color: 'var(--danger)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, marginRight: 6 }}>Delete</button>
                      <GatedAuditButton vendor={v} isPro={isPro} onUpgrade={() => { setUpgradeReason('Audit Export is a Pro feature. Upgrade to generate compliance reports.'); setUpgradeOpen(true) }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, width: 460, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>{editing ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            {inp('Name', 'name')}{inp('Email', 'email', 'email')}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Phone</label>
              <PhoneInput value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
            </div>
            {inp('Category', 'category')}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Required Documents</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {DOC_TYPES.map(t => {
                  const sel = form.required_docs.includes(t)
                  return <button key={t} onClick={() => toggleDoc(t)} style={{ padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontWeight: 500, background: sel ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid', borderColor: sel ? 'var(--accent)' : 'var(--border)', color: sel ? '#fff' : 'var(--text-secondary)' }}>{sel ? '✓ ' : ''}{t}</button>
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />
    </>
  )
}
