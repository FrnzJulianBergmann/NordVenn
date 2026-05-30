import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

// 1. Keep only My Workspace
src = src.replace(
  `const WORKSPACES = [
  { id: 'main', name: 'My Workspace', badge: 'Personal', color: '#4C6FFF' },
  { id: 'defense', name: 'NordVenn Defense', badge: 'Enterprise', color: '#0ea871' },
  { id: 'sandbox', name: 'Sandbox', badge: 'Sandbox', color: '#e8970a' },
]`,
  `const WORKSPACES = [
  { id: 'main', name: 'My Workspace', badge: 'Personal', color: '#4C6FFF' },
]`
)

// 2. Remove Workspace Settings link from dropdown footer
src = src.replace(
  `                <Link href="/settings" onClick={() => setWsOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'7px 8px', borderRadius:6, textDecoration:'none',
                  color:'var(--text-secondary)', fontSize:12,
                }}>
                  <div style={{width:22,height:22,borderRadius:6,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                  </div>
                  Workspace Settings
                </Link>`,
  ``
)

writeFileSync(resolve('components/sidebar.tsx'), src, 'utf8')
console.log('✅ Workspace dropdown cleaned up')
