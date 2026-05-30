import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'lib/workspace.ts': `import { supabase } from './supabase'

export async function getOrCreateWorkspace() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get workspaces for user
  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at')

  if (data && data.length > 0) {
    // Check if active workspace in localStorage
    const activeId = localStorage.getItem('active_workspace_id')
    const active = data.find(w => w.id === activeId) || data[0]
    if (!activeId) localStorage.setItem('active_workspace_id', active.id)
    return { workspace: active, all: data }
  }

  // Create default workspace
  const { data: created } = await supabase
    .from('workspaces')
    .insert({ name: 'My Workspace', owner_id: user.id })
    .select()
    .single()

  if (created) localStorage.setItem('active_workspace_id', created.id)
  return { workspace: created, all: [created] }
}

export function getActiveWorkspaceId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('active_workspace_id')
}

export function setActiveWorkspaceId(id: string) {
  localStorage.setItem('active_workspace_id', id)
}
`,

'components/workspace-provider.tsx': `'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateWorkspace, setActiveWorkspaceId } from '@/lib/workspace'

type WS = { id: string; name: string; owner_id: string }
type Ctx = { workspace: WS | null; all: WS[]; switchTo: (id: string) => void; refresh: () => void }

const WorkspaceCtx = createContext<Ctx>({ workspace: null, all: [], switchTo: () => {}, refresh: () => {} })

export const useWorkspace = () => useContext(WorkspaceCtx)

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WS | null>(null)
  const [all, setAll] = useState<WS[]>([])

  const load = async () => {
    const res = await getOrCreateWorkspace()
    if (res) { setWorkspace(res.workspace); setAll(res.all) }
  }

  const switchTo = (id: string) => {
    setActiveWorkspaceId(id)
    const ws = all.find(w => w.id === id)
    if (ws) setWorkspace(ws)
    window.location.reload()
  }

  useEffect(() => { load() }, [])

  return (
    <WorkspaceCtx.Provider value={{ workspace, all, switchTo, refresh: load }}>
      {children}
    </WorkspaceCtx.Provider>
  )
}
`,

'app/(dashboard)/layout.tsx': `'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/sidebar'
import Toaster from '@/components/toast'
import WorkspaceProvider from '@/components/workspace-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
    })
  }, [])

  return (
    <WorkspaceProvider>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)' }}>
          {children}
        </main>
        <Toaster />
      </div>
    </WorkspaceProvider>
  )
}
`,

'components/sidebar.tsx': `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useWorkspace } from './workspace-provider'
import { supabase } from '@/lib/supabase'

const mainNav = [
  { label: 'Overview', href: '/' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Documents', href: '/documents' },
]
const systemNav = [
  { label: 'Activity Log', href: '/activity' },
  { label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const path = usePathname()
  const { workspace, all, switchTo } = useWorkspace()
  const [wsOpen, setWsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const createWs = async () => {
    if (!newName.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('workspaces').insert({ name: newName.trim(), owner_id: user?.id }).select().single()
    if (data) switchTo(data.id)
    setCreating(false); setNewName('')
  }

  const NavItem = ({ label, href }: { label: string; href: string }) => {
    const active = path === href
    return (
      <Link href={href} style={{
        display:'flex',alignItems:'center',padding:'7px 10px',borderRadius:6,marginBottom:1,
        textDecoration:'none',fontSize:13,
        color:active?'var(--text-primary)':'var(--text-secondary)',
        background:active?'var(--bg-elevated)':'transparent',fontWeight:active?500:400,
        borderLeft:active?'2px solid var(--accent)':'2px solid transparent',
      }}>{label}</Link>
    )
  }

  return (
    <aside style={{width:220,minHeight:'100vh',background:'var(--bg-surface)',borderRight:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50}}>
      <div style={{padding:'16px',borderBottom:'1px solid var(--border-subtle)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <div style={{width:26,height:26,background:'var(--accent)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>N</div>
          <span style={{fontWeight:700,fontSize:13,color:'var(--text-primary)'}}>NordVen</span>
        </div>

        {/* Workspace switcher */}
        <div style={{position:'relative'}}>
          <button onClick={()=>setWsOpen(p=>!p)} style={{
            width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,
            padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'
          }}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:16,height:16,borderRadius:4,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>
                {workspace?.name?.[0]||'W'}
              </div>
              <span style={{fontSize:12,color:'var(--text-primary)',fontWeight:500,maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{workspace?.name||'Loading...'}</span>
            </div>
            <span style={{color:'var(--text-muted)',fontSize:10}}>▾</span>
          </button>

          {wsOpen&&(
            <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,zIndex:99,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
              <div style={{padding:'6px',fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',padding:'8px 10px 4px',fontWeight:600}}>Workspaces</div>
              {all.map(w=>(
                <button key={w.id} onClick={()=>{ switchTo(w.id); setWsOpen(false) }} style={{
                  width:'100%',background:workspace?.id===w.id?'var(--bg-elevated)':'none',
                  border:'none',padding:'7px 10px',display:'flex',alignItems:'center',gap:8,cursor:'pointer',
                  borderRadius:6,margin:'1px 4px',width:'calc(100% - 8px)'
                }}>
                  <div style={{width:18,height:18,borderRadius:4,background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>{w.name[0]}</div>
                  <span style={{fontSize:12,color:'var(--text-primary)'}}>{w.name}</span>
                  {workspace?.id===w.id&&<span style={{marginLeft:'auto',color:'var(--accent)',fontSize:10}}>✓</span>}
                </button>
              ))}
              <div style={{borderTop:'1px solid var(--border-subtle)',padding:6}}>
                {creating?(
                  <div style={{display:'flex',gap:4,padding:'2px'}}>
                    <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createWs()}
                      placeholder="Workspace name..." style={{flex:1,background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:5,padding:'5px 8px',fontSize:11,color:'var(--text-primary)',outline:'none'}}/>
                    <button onClick={createWs} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:5,padding:'5px 8px',fontSize:11,cursor:'pointer'}}>+</button>
                  </div>
                ):(
                  <button onClick={()=>setCreating(true)} style={{width:'100%',background:'none',border:'none',padding:'6px 10px',fontSize:11,color:'var(--text-secondary)',cursor:'pointer',textAlign:'left'}}>+ Create Workspace</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <nav style={{padding:'10px 8px',flex:1}}>
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',marginBottom:4}}>Workspace</div>
        {mainNav.map(n=><NavItem key={n.href} {...n}/>)}
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',margin:'12px 0 4px'}}>System</div>
        {systemNav.map(n=><NavItem key={n.href} {...n}/>)}
      </nav>

      <div style={{padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:700}}>A</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500}}>Admin</div>
          <div style={{fontSize:10,color:'var(--text-muted)'}}>Owner</div>
        </div>
      </div>
    </aside>
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
console.log('\n✅ Workspace foundation done. Next: update pages to use workspace_id.')
