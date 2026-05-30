'use client'
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
