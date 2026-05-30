import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'components/topbar.tsx': `'use client'
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

      <div style={{ position: 'relative' }}>
        <div onClick={logout} title="Sign out" style={{
          width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'
        }}>A</div>
      </div>
    </div>
  )
}
`,

'app/(dashboard)/layout.tsx': `'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
    })
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)' }}>
        {children}
      </main>
    </div>
  )
}
`,
}

for (const [f,c] of Object.entries(files)) {
  const full = join(base,f)
  mkdirSync(dirname(full),{recursive:true})
  writeFileSync(full,c,'utf8')
  console.log('✓',f)
}
console.log('\n✅ Topbar v2 done.')
