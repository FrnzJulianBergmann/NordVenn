'use client'
import { ActionCenter } from '@/components/action-center'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const onSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push('/vendors?q=' + encodeURIComponent(search.trim()))
    }
  }

  return (
    <div style={{
      height: 52, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 40
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 7, padding: '6px 12px', width: 220
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={onSearch}
          placeholder="Search or type command..."
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', width: '100%' }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 4 }}>⌘K</span>
      </div>

      <div style={{
        fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)',
        border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px'
      }}>
        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      <ActionCenter />

      <button onClick={logout} title="Sign out" style={{
        width: 32, height: 32, borderRadius: 8, background: 'none',
        border: '1px solid transparent', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
