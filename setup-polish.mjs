import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'components/sidebar.tsx': `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Overview', href: '/', icon: '⊞' },
  { label: 'Vendors', href: '/vendors', icon: '◈' },
  { label: 'Documents', href: '/documents', icon: '❑' },
  { label: 'Activity Log', href: '/activity', icon: '☰' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width:220,minHeight:'100vh',background:'var(--bg-surface)',
      borderRight:'1px solid var(--border-subtle)',display:'flex',
      flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50
    }}>
      <div style={{padding:'20px 18px 16px',borderBottom:'1px solid var(--border-subtle)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,background:'var(--accent)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>V</div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:'var(--text-primary)',letterSpacing:'-0.3px'}}>VendorPilot</div>
            <div style={{fontSize:10,color:'var(--text-muted)'}}>Workspace</div>
          </div>
        </div>
      </div>
      <div style={{padding:'8px',fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 14px 4px'}}>Main</div>
      <nav style={{padding:'0 8px',flex:1}}>
        {nav.map(({label,href,icon})=>{
          const active = path===href
          return (
            <Link key={href} href={href} style={{
              display:'flex',alignItems:'center',gap:9,padding:'7px 10px',
              borderRadius:6,marginBottom:1,textDecoration:'none',fontSize:13,
              color:active?'var(--text-primary)':'var(--text-secondary)',
              background:active?'var(--bg-elevated)':'transparent',
              fontWeight:active?500:400,transition:'background 0.15s',
              borderLeft:active?'2px solid var(--accent)':'2px solid transparent',
            }}>
              <span style={{fontSize:13,width:16,textAlign:'center'}}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:26,height:26,borderRadius:'50%',background:'var(--bg-elevated)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--text-secondary)',fontWeight:600}}>A</div>
        <div style={{fontSize:12,color:'var(--text-secondary)'}}>Admin</div>
      </div>
    </aside>
  )
}
`,

'app/(dashboard)/layout.tsx': `import Sidebar from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main style={{marginLeft:220,flex:1,minHeight:'100vh',background:'var(--bg-base)',maxWidth:'calc(100vw - 220px)'}}>
        {children}
      </main>
    </div>
  )
}
`,

'app/(dashboard)/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'

export default function OverviewPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  useEffect(()=>{
    supabase.from('vendors').select('*').then(r=>setVendors(r.data||[]))
    supabase.from('documents').select('*').then(r=>setDocs(r.data||[]))
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(8).then(r=>setLogs(r.data||[]))
  },[])

  const now = new Date()
  const in30 = new Date(); in30.setDate(now.getDate()+30)

  const metrics = [
    {label:'Total Vendors',value:vendors.length,sub:'All time',color:'#6366f1'},
    {label:'Active',value:vendors.filter(v=>v.status==='active').length,sub:'Compliant',color:'#10b981'},
    {label:'Pending Review',value:vendors.filter(v=>v.status==='pending').length,sub:'Requires review',color:'#f59e0b'},
    {label:'Expiring Soon',value:docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<=in30&&new Date(d.expiry_date)>=now).length,sub:'< 30 days',color:'#f59e0b'},
    {label:'Expired Docs',value:docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<now).length,sub:'Action required',color:'#ef4444'},
    {label:'Total Documents',value:docs.length,sub:'Across all vendors',color:'#6366f1'},
  ]

  const alerts = [
    ...docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<now).slice(0,3).map(d=>({type:'danger',msg:d.name+' expired'})),
    ...vendors.filter(v=>v.status==='pending').slice(0,2).map(v=>({type:'warning',msg:v.name+' pending review'})),
    ...docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<=in30&&new Date(d.expiry_date)>=now).slice(0,2).map(d=>({type:'warning',msg:d.name+' expiring soon'})),
  ]

  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{padding:'0 24px 28px',display:'grid',gridTemplateColumns:'1fr 240px',gap:20}}>
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
            {metrics.map(m=>(
              <div key={m.label} style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,fontWeight:500}}>{m.label}</div>
                <div style={{fontSize:26,fontWeight:700,color:m.color,lineHeight:1,marginBottom:4}}>{m.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>Recent Vendors</span>
              <a href="/vendors" style={{fontSize:11,color:'var(--accent)',textDecoration:'none'}}>View all</a>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                  {['Vendor Name','Category','Status','Created'].map(h=>(
                    <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.slice(0,6).map(v=>(
                  <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)'}}>
                    <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)'}}>{v.name}</td>
                    <td style={{padding:'10px 14px',color:'var(--text-secondary)'}}>{v.category||'—'}</td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{
                        color:v.status==='active'?'#10b981':v.status==='pending'?'#f59e0b':'#ef4444',
                        background:(v.status==='active'?'#10b981':v.status==='pending'?'#f59e0b':'#ef4444')+'20',
                        padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'
                      }}>{v.status}</span>
                    </td>
                    <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:11}}>{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!vendors.length&&<tr><td colSpan={4} style={{padding:'16px 14px',color:'var(--text-muted)',fontSize:13}}>No vendors yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:14}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',marginBottom:12,display:'flex',justifyContent:'space-between'}}>
              Alerts <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:400}}>View all</span>
            </div>
            {!alerts.length&&<div style={{fontSize:12,color:'var(--text-muted)'}}>No alerts.</div>}
            {alerts.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:8,marginBottom:10,alignItems:'flex-start',paddingBottom:10,borderBottom:i<alerts.length-1?'1px solid var(--border-subtle)':'none'}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:a.type==='danger'?'#ef4444':'#f59e0b',marginTop:5,flexShrink:0}}/>
                <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.4}}>{a.msg}</div>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:14,flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Activity Log</div>
            {!logs.length&&<div style={{fontSize:12,color:'var(--text-muted)'}}>No activity yet.</div>}
            {logs.map((l,i)=>(
              <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<logs.length-1?'1px solid var(--border-subtle)':'none'}}>
                <div style={{fontSize:12,color:'var(--text-primary)',marginBottom:2}}>{l.action}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{l.description}</div>
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
console.log('\n✅ Polish done. Refresh browser.')
