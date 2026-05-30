import { writeFileSync } from 'fs'
import { resolve } from 'path'

const content = `'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

const mainNav = [
  { label: 'Overview', href: '/' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Documents', href: '/documents' },
]
const systemNav = [
  { label: 'Activity Log', href: '/activity' },
  { label: 'Settings', href: '/settings' },
]

const WORKSPACES = [
  { id: 'main', name: 'My Workspace', badge: 'Personal', color: '#4C6FFF' },
  { id: 'defense', name: 'NordVenn Defense', badge: 'Enterprise', color: '#0ea871' },
  { id: 'sandbox', name: 'Sandbox', badge: 'Sandbox', color: '#e8970a' },
]

const BADGE_STYLE: Record<string, { color: string; bg: string }> = {
  Personal:   { color: '#7AA2FF', bg: '#4C6FFF18' },
  Enterprise: { color: '#0ea871', bg: '#0ea87118' },
  Sandbox:    { color: '#e8970a', bg: '#e8970a18' },
}

const NavItem = ({ label, href, active }: { label: string; href: string; active: boolean }) => (
  <Link href={href} style={{
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'6px 10px',borderRadius:6,marginBottom:1,textDecoration:'none',fontSize:13,
    color:active?'var(--text-primary)':'var(--text-secondary)',
    background:active?'var(--bg-elevated)':'transparent',
    fontWeight:active?500:400,
    borderLeft:active?'2px solid var(--accent)':'2px solid transparent',
  }}>{label}</Link>
)

const WorkspaceIcon = ({ name, color }: { name: string; color: string }) => (
  <div style={{
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    background: color + '22', border: '1px solid ' + color + '44',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color,
  }}>
    {name.charAt(0).toUpperCase()}
  </div>
)

export default function Sidebar() {
  const path = usePathname()
  const [user, setUser] = useState<any>(null)
  const [wsOpen, setWsOpen] = useState(false)
  const [activeWs, setActiveWs] = useState(WORKSPACES[0])
  const wsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const badge = BADGE_STYLE[activeWs.badge] || BADGE_STYLE.Personal

  return (
    <aside style={{width:220,minHeight:'100vh',background:'var(--bg-surface)',borderRight:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50}}>
      <div style={{padding:'16px',borderBottom:'1px solid var(--border-subtle)'}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V4l8 12V4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4v16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{fontWeight:700,fontSize:13,color:'var(--text-primary)',letterSpacing:'-0.3px'}}>NordVenn</div>
        </div>

        {/* Workspace Selector */}
        <div ref={wsRef} style={{position:'relative'}}>
          <button onClick={() => setWsOpen(o => !o)} style={{
            width:'100%', background:'var(--bg-elevated)', border:'1px solid var(--border)',
            borderRadius:7, padding:'6px 8px', display:'flex', alignItems:'center',
            gap:7, cursor:'pointer', borderColor: wsOpen ? 'var(--accent)' : 'var(--border)',
            transition: 'border-color 0.15s',
          }}>
            <WorkspaceIcon name={activeWs.name} color={activeWs.color} />
            <div style={{flex:1,minWidth:0,textAlign:'left'}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeWs.name}</div>
              <div style={{fontSize:9,marginTop:1}}>
                <span style={{color:badge.color,background:badge.bg,padding:'0 5px',borderRadius:3,fontWeight:700,letterSpacing:'0.05em'}}>{activeWs.badge}</span>
              </div>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{flexShrink:0,transform:wsOpen?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Dropdown */}
          {wsOpen && (
            <div style={{
              position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:100,
              background:'var(--bg-surface)', border:'1px solid var(--border)',
              borderRadius:9, boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
              overflow:'hidden',
              animation:'wsIn 0.15s ease',
            }}>
              <style>{\`@keyframes wsIn { from { opacity:0; transform:scale(0.97) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }\`}</style>

              <div style={{padding:'6px 6px 4px'}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-muted)',padding:'4px 8px 6px'}}>Workspaces</div>
                {WORKSPACES.map(ws => {
                  const isActive = ws.id === activeWs.id
                  const b = BADGE_STYLE[ws.badge] || BADGE_STYLE.Personal
                  return (
                    <button key={ws.id} onClick={() => { setActiveWs(ws); setWsOpen(false) }} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:8,
                      padding:'7px 8px', borderRadius:6, border:'none', cursor:'pointer',
                      background: isActive ? 'var(--bg-elevated)' : 'transparent',
                      marginBottom:1,
                    }}>
                      <WorkspaceIcon name={ws.name} color={ws.color} />
                      <div style={{flex:1,minWidth:0,textAlign:'left'}}>
                        <div style={{fontSize:12,fontWeight:isActive?600:400,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ws.name}</div>
                      </div>
                      <span style={{fontSize:9,fontWeight:700,color:b.color,background:b.bg,padding:'1px 5px',borderRadius:3,flexShrink:0}}>{ws.badge}</span>
                      {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </button>
                  )
                })}
              </div>

              <div style={{borderTop:'1px solid var(--border-subtle)',padding:'4px 6px'}}>
                <button onClick={() => setWsOpen(false)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:8,
                  padding:'7px 8px', borderRadius:6, border:'none', cursor:'pointer',
                  background:'transparent', color:'var(--accent)', fontSize:12, fontWeight:500,
                }}>
                  <div style={{width:22,height:22,borderRadius:6,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                  Create Workspace
                </button>
                <Link href="/settings" onClick={() => setWsOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'7px 8px', borderRadius:6, textDecoration:'none',
                  color:'var(--text-secondary)', fontSize:12,
                }}>
                  <div style={{width:22,height:22,borderRadius:6,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                  </div>
                  Workspace Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav style={{padding:'10px 8px',flex:1,overflowY:'auto'}}>
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',marginBottom:4}}>Workspace</div>
        {mainNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href} />
        ))}
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',margin:'12px 0 4px'}}>System</div>
        {systemNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href} />
        ))}
      </nav>

      {/* Business Card */}
      <div style={{padding:'10px 10px 12px',borderTop:'1px solid var(--border-subtle)'}}>
        <div style={{background:'#ffffff',borderRadius:10,padding:'14px 14px 12px',boxShadow:'0 2px 12px rgba(0,0,0,0.35)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-4,bottom:-6,opacity:0.07}}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V4l8 12V4" stroke="#4C6FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4v16" stroke="#4C6FFF" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:'#0f0f1a',letterSpacing:'-0.2px',marginBottom:2}}>
            {user?.user_metadata?.full_name || 'Admin'}
          </div>
          <div style={{fontSize:11,color:'#7a8599',marginBottom:10}}>
            {user?.user_metadata?.role || 'Head of Operations'}
          </div>
          {[
            { icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', val: user?.email || '' },
            { icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13 19.79 19.79 0 0 1 1.08 4.18 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z', val: user?.user_metadata?.phone || '+1 (415) 555-0198' },
            { icon:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', val: 'nordvenn.com' },
          ].filter(r => r.val).map((r, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2" style={{flexShrink:0}}>
                <path d={r.icon}/>
              </svg>
              <span style={{fontSize:10,color:'#5a6478',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
`

writeFileSync(resolve('components/sidebar.tsx'), content, 'utf8')
console.log('✅ Workspace dropdown upgraded!')
