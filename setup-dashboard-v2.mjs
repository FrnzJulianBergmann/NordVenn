import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/(dashboard)/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'
import Link from 'next/link'

const Badge = ({ s }: { s: string }) => {
  const map: any = { active:['#0ea871','#0ea87118'], approved:['#0ea871','#0ea87118'], pending:['#e8970a','#e8970a18'], expired:['#e8403a','#e8403a18'], inactive:['#44445a','#44445a18'] }
  const [c, bg] = map[s] || ['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</span>
}

const Icon = ({ d, color }: { d: string; color: string }) => (
  <div style={{width:32,height:32,borderRadius:8,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d={d}/></svg>
  </div>
)

export default function OverviewPage() {
  const [vendors,setVendors]=useState<any[]>([])
  const [docs,setDocs]=useState<any[]>([])
  const [logs,setLogs]=useState<any[]>([])

  useEffect(()=>{
    supabase.from('vendors').select('*').then(r=>setVendors(r.data||[]))
    supabase.from('documents').select('*,vendors(name)').then(r=>setDocs(r.data||[]))
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(10).then(r=>setLogs(r.data||[]))
  },[])

  const now=new Date()
  const in30=new Date();in30.setDate(now.getDate()+30)
  const expired=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<now)
  const expiring=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<=in30&&new Date(d.expiry_date)>=now)

  const metrics=[
    {label:'Total Vendors',value:vendors.length,sub:'All time',color:'#5b5ef4',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'},
    {label:'Pending Review',value:vendors.filter(v=>v.status==='pending').length,sub:'Requires review',color:'#e8970a',icon:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'},
    {label:'Approved',value:vendors.filter(v=>v.status==='active').length,sub:'Compliant',color:'#0ea871',icon:'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3'},
    {label:'Expiring Soon',value:expiring.length,sub:'< 30 days',color:'#e8970a',icon:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'},
    {label:'Expired Docs',value:expired.length,sub:'Action required',color:'#e8403a',icon:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'},
    {label:'Total Documents',value:docs.length,sub:'Across all vendors',color:'#5b5ef4',icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6'},
  ]

  const alerts=[
    ...expired.slice(0,3).map(d=>({type:'danger',msg:d.name+' has expired'})),
    ...vendors.filter(v=>v.status==='pending').slice(0,2).map(v=>({type:'warning',msg:v.name+' pending review'})),
    ...expiring.slice(0,2).map(d=>({type:'warning',msg:d.name+' expiring soon'})),
  ]

  const daysUntil = (date:string) => Math.ceil((new Date(date).getTime()-now.getTime())/(1000*60*60*24))

  const card = {background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8}

  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{padding:'16px 20px 28px',display:'grid',gridTemplateColumns:'1fr 230px',gap:16}}>
        <div>
          {/* Metric Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {metrics.map(m=>(
              <div key={m.label} style={{...card,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{m.label}</div>
                  <Icon d={m.icon} color={m.color} />
                </div>
                <div style={{fontSize:28,fontWeight:700,color:m.color,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{m.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent Vendors */}
          <div style={{...card,overflow:'hidden',marginBottom:16}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>Recent Vendors</span>
              <Link href="/vendors" style={{fontSize:11,color:'var(--accent)',textDecoration:'none'}}>View all →</Link>
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
                {vendors.slice(0,5).map((v,i)=>(
                  <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                    <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{v.name}</td>
                    <td style={{padding:'10px 14px',color:'var(--text-secondary)',fontSize:13}}>{v.category||'—'}</td>
                    <td style={{padding:'10px 14px'}}><Badge s={v.status}/></td>
                    <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:11}}>{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!vendors.length&&<tr><td colSpan={4} style={{padding:'20px 14px',color:'var(--text-muted)',fontSize:13,textAlign:'center'}}>No vendors yet — <Link href="/vendors" style={{color:'var(--accent)'}}>add one</Link></td></tr>}
              </tbody>
            </table>
          </div>

          {/* Documents Expiring Soon */}
          <div style={{...card,overflow:'hidden'}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>Documents Expiring Soon</span>
              <Link href="/documents" style={{fontSize:11,color:'var(--accent)',textDecoration:'none'}}>View all →</Link>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                  {['Vendor','Document','Type','Expires In','Status'].map(h=>(
                    <th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...expiring,...expired].slice(0,5).map((d,i)=>{
                  const days = daysUntil(d.expiry_date)
                  const isExp = days < 0
                  return (
                    <tr key={d.id} style={{borderBottom:'1px solid var(--border-subtle)'}}>
                      <td style={{padding:'10px 14px',color:'var(--text-secondary)',fontSize:13}}>{d.vendors?.name||'—'}</td>
                      <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{d.name}</td>
                      <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:12,textTransform:'uppercase'}}>{d.type||'—'}</td>
                      <td style={{padding:'10px 14px',fontSize:12,color:isExp?'var(--danger)':'var(--warning)',fontWeight:500}}>{isExp?'Expired':days+' days'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{color:isExp?'var(--danger)':'var(--warning)',background:(isExp?'var(--danger)':'var(--warning)')+'18',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700}}>{isExp?'EXPIRED':'WARNING'}</span>
                      </td>
                    </tr>
                  )
                })}
                {!expiring.length&&!expired.length&&<tr><td colSpan={5} style={{padding:'20px 14px',color:'var(--text-muted)',fontSize:13,textAlign:'center'}}>No expiring documents</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
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

          <div style={{...card,padding:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Quick Actions</div>
            {[
              {label:'Add Vendor',href:'/vendors'},
              {label:'Upload Document',href:'/documents'},
              {label:'View Activity Log',href:'/activity'},
            ].map(a=>(
              <Link key={a.label} href={a.href} style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'8px 10px',borderRadius:6,marginBottom:4,textDecoration:'none',
                fontSize:12,color:'var(--text-secondary)',background:'var(--bg-elevated)',
                border:'1px solid var(--border-subtle)'
              }}>
                {a.label} <span style={{color:'var(--accent)'}}>→</span>
              </Link>
            ))}
          </div>

          <div style={{...card,padding:14,flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Activity Log</div>
            {!logs.length&&<div style={{fontSize:12,color:'var(--text-muted)',textAlign:'center',padding:'8px 0'}}>No activity yet</div>}
            {logs.map((l,i)=>(
              <div key={i} style={{padding:'7px 0',borderBottom:i<logs.length-1?'1px solid var(--border-subtle)':'none'}}>
                <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500}}>{l.action}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{l.description}</div>
                <div style={{fontSize:10,color:'var(--text-muted)',marginTop:2,opacity:0.5}}>{new Date(l.created_at).toLocaleTimeString()}</div>
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
console.log('\n✅ Dashboard v2 done.')
