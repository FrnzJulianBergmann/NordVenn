import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'lib/supabase.ts': `import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(url, key)
`,

'types/vendor.ts': `export type Vendor = {
  id: string
  name: string
  email: string
  phone: string
  category: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}
`,

'app/(dashboard)/vendors/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Vendor } from '@/types/vendor'
import Topbar from '@/components/topbar'
import VendorTable from '@/components/vendor-table'
import VendorDialog from '@/components/vendor-dialog'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
    setVendors(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (v: Vendor) => { setEditing(v); setOpen(true) }
  const handleAdd = () => { setEditing(null); setOpen(true) }
  const handleDelete = async (id: string) => {
    await supabase.from('vendors').delete().eq('id', id)
    load()
  }

  return (
    <>
      <Topbar title="Vendors" subtitle="Manage your vendor list." />
      <div style={{ padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <input
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: 13, width: 240, outline: 'none'
            }}
          />
          <button onClick={handleAdd} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>+ Add Vendor</button>
        </div>
        <VendorTable vendors={filtered} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        <VendorDialog open={open} onClose={() => setOpen(false)} vendor={editing} onSave={load} />
      </div>
    </>
  )
}
`,

'components/vendor-table.tsx': `import type { Vendor } from '@/types/vendor'

const statusColor: Record<string, string> = {
  active: '#10b981', inactive: '#55556a', pending: '#f59e0b'
}

export default function VendorTable({ vendors, loading, onEdit, onDelete }: {
  vendors: Vendor[], loading: boolean,
  onEdit: (v: Vendor) => void, onDelete: (id: string) => void
}) {
  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
  if (!vendors.length) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No vendors found.</p>

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Name','Email','Phone','Category','Status','Actions'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: i % 2 === 0 ? 'var(--bg-base)' : 'var(--bg-surface)' }}>
              <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{v.name}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.email || '—'}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.phone || '—'}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>{v.category || '—'}</td>
              <td style={{ padding: '11px 14px' }}>
                <span style={{
                  color: statusColor[v.status] || '#888',
                  background: (statusColor[v.status] || '#888') + '22',
                  padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
                }}>{v.status}</span>
              </td>
              <td style={{ padding: '11px 14px' }}>
                <button onClick={() => onEdit(v)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12, marginRight: 6 }}>Edit</button>
                <button onClick={() => onDelete(v.id)} style={{ background: 'none', border: '1px solid #ef444433', color: 'var(--danger)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
`,

'components/vendor-dialog.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Vendor } from '@/types/vendor'

const field = (label: string, value: string, onChange: (v: string) => void, type = 'text') => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none'
    }} />
  </div>
)

export default function VendorDialog({ open, onClose, vendor, onSave }: {
  open: boolean, onClose: () => void, vendor: Vendor | null, onSave: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('active')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (vendor) { setName(vendor.name); setEmail(vendor.email || ''); setPhone(vendor.phone || ''); setCategory(vendor.category || ''); setStatus(vendor.status) }
    else { setName(''); setEmail(''); setPhone(''); setCategory(''); setStatus('active') }
  }, [vendor, open])

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    const data = { name, email, phone, category, status }
    if (vendor) await supabase.from('vendors').update(data).eq('id', vendor.id)
    else await supabase.from('vendors').insert(data)
    setSaving(false)
    onSave()
    onClose()
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, width: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>{vendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        {field('Name', name, setName)}
        {field('Email', email, setEmail, 'email')}
        {field('Phone', phone, setPhone)}
        {field('Category', category, setCategory)}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{
            width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none'
          }}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
`,
}

for (const [filePath, content] of Object.entries(files)) {
  const full = join(base, filePath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, 'utf8')
  console.log('✓', filePath)
}

console.log('\n✅ Vendors page siap. Cek localhost:3000/vendors')
