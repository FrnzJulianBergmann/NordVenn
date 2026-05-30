import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/globals.css': `@import "tailwindcss";

:root {
  --bg-base: #080810;
  --bg-surface: #0f0f1a;
  --bg-elevated: #161625;
  --bg-hover: #1e1e30;
  --border: #252538;
  --border-subtle: #18182a;
  --text-primary: #eeeef5;
  --text-secondary: #7878a0;
  --text-muted: #44445a;
  --accent: #5b5ef4;
  --accent-hover: #7476f8;
  --success: #0ea871;
  --warning: #e8970a;
  --danger: #e8403a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-base); color: var(--text-primary); font-family: 'Inter', -apple-system, sans-serif; font-size: 14px; line-height: 1.5; }
a { color: inherit; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`,

'components/sidebar.tsx': `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Overview', href: '/', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: 'Vendors', href: '/vendors', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Documents', href: '/documents', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg> },
  { label: 'Activity Log', href: '/activity', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{width:220,minHeight:'100vh',background:'var(--bg-surface)',borderRight:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50}}>
      <div style={{padding:'18px 16px 16px',borderBottom:'1px solid var(--border-subtle)'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:28,height:28,background:'var(--accent)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',letterSpacing:'-0.5px'}}>V</div>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:'var(--text-primary)',letterSpacing:'-0.3px'}}>VendorPilot</div>
            <div style={{fontSize:10,color:'var(--text-muted)',marginTop:1}}>Workspace</div>
          </div>
        </div>
      </div>
      <div style={{padding:'14px 10px 6px'}}>
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'0 8px',marginBottom:4}}>Main</div>
        {nav.map(({label,href,icon})=>{
          const active = path===href
          return (
            <Link key={href} href={href} style={{
              display:'flex',alignItems:'center',gap:9,padding:'7px 10px',borderRadius:7,
              marginBottom:2,textDecoration:'none',fontSize:13,
              color:active?'var(--text-primary)':'var(--text-secondary)',
              background:active?'var(--bg-elevated)':'transparent',
              fontWeight:active?500:400,
              borderLeft:active?'2px solid var(--accent)':'2px solid transparent',
            }}>
              <span style={{opacity:active?1:0.5,display:'flex',alignItems:'center'}}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>
      <div style={{flex:1}}/>
      <div style={{padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'var(--bg-elevated)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--accent)',fontWeight:700}}>A</div>
        <div>
          <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500}}>Admin</div>
          <div style={{fontSize:10,color:'var(--text-muted)'}}>Owner</div>
        </div>
      </div>
    </aside>
  )
}
`,

'components/topbar.tsx': `'use client'
import { supabase } from '@/lib/supabase'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const logout = async () => { await supabase.auth.signOut(); window.location.href = '/login' }
  return (
    <div style={{padding:'22px 24px 0',marginBottom:22,display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'1px solid var(--border-subtle)',paddingBottom:18}}>
      <div>
        <h1 style={{fontSize:18,fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.5px'}}>{title}</h1>
        {subtitle && <p style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{subtitle}</p>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontSize:12,color:'var(--text-muted)',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'5px 10px'}}>
          {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </div>
        <button onClick={logout} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-muted)',borderRadius:6,padding:'5px 12px',fontSize:12,cursor:'pointer'}}>Sign out</button>
      </div>
    </div>
  )
}
`,

'app/(dashboard)/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'

const Badge = ({status}:{status:string}) => {
  const c:any = {active:['#0ea871','#0ea87118'],pending:['#e8970a','#e8970a18'],inactive:['#44445a','#44445a18']}
  const [col,bg] = c[status]||['#44445a','#44445a18']
  return <span style={{color:col,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{status}</span>
}

export default function OverviewPage() {
  const [vendors,setVendors]=useState<any[]>([])
  const [docs,setDocs]=useState<any[]>([])
  const [logs,setLogs]=useState<any[]>([])

  useEffect(()=>{
    supabase.from('vendors').select('*').then(r=>setVendors(r.data||[]))
    supabase.from('documents').select('*').then(r=>setDocs(r.data||[]))
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(10).then(r=>setLogs(r.data||[]))
  },[])

  const now=new Date()
  const in30=new Date();in30.setDate(now.getDate()+30)
  const expired=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<now)
  const expiring=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<=in30&&new Date(d.expiry_date)>=now)

  const metrics=[
    {label:'Total Vendors',value:vendors.length,sub:'All time',color:'var(--accent)'},
    {label:'Pending Review',value:vendors.filter(v=>v.status==='pending').length,sub:'Requires review',color:'var(--warning)'},
    {label:'Approved',value:vendors.filter(v=>v.status==='active').length,sub:'Compliant',color:'var(--success)'},
    {label:'Expiring Soon',value:expiring.length,sub:'< 30 days',color:'var(--warning)'},
    {label:'Expired',value:expired.length,sub:'Action required',color:'var(--danger)'},
    {label:'Total Documents',value:docs.length,sub:'Across all vendors',color:'var(--accent)'},
  ]

  const alerts=[
    ...expired.slice(0,3).map(d=>({type:'danger',msg:d.name+' has expired'})),
    ...vendors.filter(v=>v.status==='pending').slice(0,2).map(v=>({type:'warning',msg:v.name+' pending review'})),
    ...expiring.slice(0,2).map(d=>({type:'warning',msg:d.name+' expiring soon'})),
  ]

  const card = {background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8}

  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{padding:'0 24px 28px',display:'grid',gridTemplateColumns:'1fr 230px',gap:16}}>
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {metrics.map(m=>(
              <div key={m.label} style={{...card,padding:'14px 16px'}}>
                <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600,marginBottom:10}}>{m.label}</div>
                <div style={{fontSize:30,fontWeight:700,color:m.color,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{m.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{...card,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.2px'}}>Recent Vendors</span>
              <a href="/vendors" style={{fontSize:11,color:'var(--accent)',textDecoration:'none',opacity:0.8}}>View all →</a>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                  {['Vendor Name','Category','Status','Created'].map(h=>(
                    <th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.slice(0,6).map((v,i)=>(
                  <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                    <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{v.name}</td>
                    <td style={{padding:'10px 14px',color:'var(--text-secondary)',fontSize:13}}>{v.category||'—'}</td>
                    <td style={{padding:'10px 14px'}}><Badge status={v.status}/></td>
                    <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:11}}>{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!vendors.length&&<tr><td colSpan={4} style={{padding:'20px 14px',color:'var(--text-muted)',fontSize:13,textAlign:'center'}}>No vendors yet — <a href="/vendors" style={{color:'var(--accent)'}}>add one</a></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{...card,padding:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              Alerts
              {alerts.length>0&&<span style={{background:'var(--danger)',color:'#fff',fontSize:9,fontWeight:700,borderRadius:10,padding:'1px 6px'}}>{alerts.length}</span>}
            </div>
            {!alerts.length&&<div style={{fontSize:12,color:'var(--text-muted)',textAlign:'center',padding:'8px 0'}}>No alerts</div>}
            {alerts.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:8,padding:'8px 0',borderBottom:i<alerts.length-1?'1px solid var(--border-subtle)':'none',alignItems:'flex-start'}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:a.type==='danger'?'var(--danger)':'var(--warning)',marginTop:5,flexShrink:0}}/>
                <div style={{fontSize:11,color:'var(--text-secondary)',lineHeight:1.5}}>{a.msg}</div>
              </div>
            ))}
          </div>

          <div style={{...card,padding:14,flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Activity Log</div>
            {!logs.length&&<div style={{fontSize:12,color:'var(--text-muted)',textAlign:'center',padding:'8px 0'}}>No activity yet</div>}
            {logs.map((l,i)=>(
              <div key={i} style={{padding:'7px 0',borderBottom:i<logs.length-1?'1px solid var(--border-subtle)':'none'}}>
                <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500,marginBottom:2}}>{l.action}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{l.description}</div>
                <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2,opacity:0.6}}>{new Date(l.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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
console.log('\n✅ UI Polish done. Refresh browser.')
