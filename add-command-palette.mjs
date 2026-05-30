import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. components/command-palette.tsx ────────────────────────────────────────
const component = `'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Cmd = { id: string; label: string; sub?: string; icon: string; action: () => void; keywords?: string }

const Kbd = ({ k }: { k: string }) => (
  <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace' }}>{k}</span>
)

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [vendors, setVendors] = useState<any[]>([])
  const [sel, setSel] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => { setOpen(false); setQuery(''); setSel(0) }, [])

  const go = useCallback((href: string) => { router.push(href); close() }, [router, close])

  // Load vendors for search
  useEffect(() => {
    if (!open) return
    supabase.from('vendors').select('id,name,category,status').then(r => setVendors(r.data || []))
  }, [open])

  // CMD+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  // Focus input when opened
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  const staticCmds: Cmd[] = [
    { id: 'add-vendor',    label: 'Add Vendor',              sub: 'Create a new vendor',           icon: '＋', action: () => go('/vendors?action=add'),  keywords: 'create new vendor' },
    { id: 'upload-doc',   label: 'Upload Document',          sub: 'Upload a vendor document',      icon: '↑',  action: () => go('/documents?action=upload'), keywords: 'upload file doc' },
    { id: 'go-overview',  label: 'Go to Overview',           sub: 'Compliance dashboard',          icon: '⊞',  action: () => go('/'),                    keywords: 'home dashboard overview' },
    { id: 'go-vendors',   label: 'Go to Vendors',            sub: 'Manage vendor list',            icon: '◎',  action: () => go('/vendors'),             keywords: 'vendors list' },
    { id: 'go-docs',      label: 'Go to Documents',          sub: 'Manage documents',              icon: '◱',  action: () => go('/documents'),           keywords: 'documents files' },
    { id: 'go-activity',  label: 'View Activity Log',        sub: 'Recent actions',                icon: '◷',  action: () => go('/activity'),            keywords: 'activity log history' },
    { id: 'go-settings',  label: 'Open Settings',            sub: 'Account & workspace',           icon: '⚙',  action: () => go('/settings'),            keywords: 'settings account profile' },
    { id: 'expiring',     label: 'View Expiring Documents',  sub: 'Documents expiring soon',       icon: '⚠',  action: () => go('/documents?filter=expiring'), keywords: 'expiring soon warning' },
    { id: 'expired',      label: 'View Expired Documents',   sub: 'Action required',               icon: '✕',  action: () => go('/documents?filter=expired'),  keywords: 'expired critical' },
    { id: 'pending',      label: 'View Pending Vendors',     sub: 'Vendors awaiting approval',     icon: '◔',  action: () => go('/vendors?filter=pending'),    keywords: 'pending review approval' },
  ]

  const vendorCmds: Cmd[] = vendors.map(v => ({
    id: 'v-' + v.id,
    label: v.name,
    sub: (v.category || 'Vendor') + ' · ' + v.status,
    icon: '◈',
    action: () => go('/vendors'),
    keywords: v.name.toLowerCase() + ' ' + (v.category || ''),
  }))

  const q = query.toLowerCase().trim()
  const all = [...staticCmds, ...vendorCmds]
  const filtered = q
    ? all.filter(c => c.label.toLowerCase().includes(q) || c.sub?.toLowerCase().includes(q) || c.keywords?.includes(q))
    : staticCmds

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[sel]) { filtered[sel].action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, sel])

  // Reset selection on query change
  useEffect(() => setSel(0), [query])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]') as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!open) return null

  // Group static vs vendor results
  const staticResults = filtered.filter(c => !c.id.startsWith('v-'))
  const vendorResults = filtered.filter(c => c.id.startsWith('v-'))

  const Item = ({ cmd, idx }: { cmd: Cmd; idx: number }) => {
    const active = sel === idx
    return (
      <div
        data-selected={active}
        onClick={cmd.action}
        onMouseEnter={() => setSel(idx)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
          cursor: 'pointer', borderRadius: 6,
          background: active ? 'var(--bg-elevated)' : 'transparent',
          borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        }}
      >
        <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0, color: active ? 'var(--accent)' : 'var(--text-muted)' }}>{cmd.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd.label}</div>
          {cmd.sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{cmd.sub}</div>}
        </div>
        {active && <Kbd k="↵" />}
      </div>
    )
  }

  const GroupLabel = ({ label }: { label: string }) => (
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '8px 14px 4px' }}>{label}</div>
  )

  let idx = -1
  const nextIdx = () => { idx++; return idx }

  return (
    <>
      {/* Backdrop */}
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}/>

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 560, zIndex: 201,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        animation: 'cmdIn 0.15s ease',
      }}>
        <style>{\`@keyframes cmdIn { from { opacity: 0; transform: translateX(-50%) scale(0.97) } to { opacity: 1; transform: translateX(-50%) scale(1) } }\`}</style>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or type a command..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)' }}
          />
          <Kbd k="ESC" />
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 380, overflowY: 'auto', padding: '6px 6px 8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results for "{query}"</div>
          )}

          {!q && <GroupLabel label="Actions" />}
          {staticResults.map(cmd => <Item key={cmd.id} cmd={cmd} idx={nextIdx()} />)}

          {vendorResults.length > 0 && <GroupLabel label="Vendors" />}
          {vendorResults.map(cmd => <Item key={cmd.id} cmd={cmd} idx={nextIdx()} />)}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 14, alignItems: 'center' }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['ESC', 'close']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Kbd k={k} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
`

// ── 2. Inject into layout.tsx ─────────────────────────────────────────────────
const layoutPath = resolve('app/(dashboard)/layout.tsx')
let layout = readFileSync(layoutPath, 'utf8')

// Add import at top
if (!layout.includes('CommandPalette')) {
  layout = layout.replace(
    /^('use client'|import )/m,
    `import { CommandPalette } from '@/components/command-palette'\n$&`
  )
  // Inject <CommandPalette /> just before closing tag or main content
  layout = layout.replace(
    /<Sidebar\s*\/>/,
    `<Sidebar />\n      <CommandPalette />`
  )
}

writeFileSync(layoutPath, layout, 'utf8')
writeFileSync(resolve('components/command-palette.tsx'), component, 'utf8')
console.log('✅ Command Palette created & injected into layout!')
