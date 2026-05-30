import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/(dashboard)/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'

type Metric = { label: string; value: number; sub: string; color: string }

export default function OverviewPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    supabase.from('vendors').select('*').then(r => setVendors(r.data || []))
    supabase.from('documents').select('*').then(r => setDocs(r.data || []))
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(8).then(r => setLogs(r.data || []))
  }, [])

  const now = new Date()
  const in30 = new Date(now); in30.setDate(now.getDate()+30)

  const metrics: Metric[] = [
    { label: 'Total Vendors', value: vendors.length, sub: 'All time', color: '#6366f1' },
    { label: 'Active', value: vendors.filter(v=>v.status==='active').length, sub: 'Compliant', color: '#10b981' },
    { label: 'Pending Review', value: vendors.filter(v=>v.status==='pending').length, sub: 'Requires review', color: '#f59e0b' },
    { label: 'Expiring Soon', value: docs.filter(d=>d.expiry_date && new Date(d.expiry_date)<=in30).length, sub: '< 30 days', color: '#f59e0b' },
    { label: 'Expired Docs', value: docs.filter(d=>d.expiry_date && new Date(d.expiry_date)<now).length, sub: 'Action required', color: '#ef4444' },
    { label: 'Total Documents', value: docs.length, sub: 'Across all vendors', color: '#6366f1' },
  ]

  const alerts = [
    ...docs.filter(d=>d.expiry_date && new Date(d.expiry_date)<now).slice(0,3).map(d=>({ type:'danger', msg: d.name+' expired' })),
    ...vendors.filter(v=>v.status==='pending').slice(0,2).map(v=>({ type:'warning', msg: v.name+' pending review' })),
    ...docs.filter(d=>d.expiry_date && new Date(d.expiry_date)<=in30 && new Date(d.expiry_date)>=now).slice(0,2).map(d=>({ type:'warning', msg: d.name+' expiring soon' })),
  ]

  const alertColor: any = { danger:'#ef4444', warning:'#f59e0b' }

  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{padding:'0 28px 28px',display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
            {metrics.map(m=>(
              <div key={m.label} style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:'16px 18px'}}>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>{m.label}</div>
                <div style={{fontSize:28,fontWeight:700,color:m.color,lineHeight:1}}>{m.value}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-subtle)',fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>Recent Vendors</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                  {['Vendor Name','Category','Status','Created'].map(h=>(
                    <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:11,textTransform:'uppercase'}}>{h}</th>
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
                        color: v.status==='active'?'#10b981':v.status==='pending'?'#f59e0b':'#ef4444',
                        background: (v.status==='active'?'#10b981':v.status==='pending'?'#f59e0b':'#ef4444')+'22',
                        padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,textTransform:'uppercase'
                      }}>{v.status}</span>
                    </td>
                    <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:12}}>{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!vendors.length && <tr><td colSpan={4} style={{padding:'16px 14px',color:'var(--text-muted)',fontSize:13}}>No vendors yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{width:260,flexShrink:0}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:16}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-primary)'}}>Alerts</div>
            {alerts.length===0 && <div style={{fontSize:12,color:'var(--text-muted)'}}>No alerts.</div>}
            {alerts.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:alertColor[a.type],marginTop:5,flexShrink:0}}/>
                <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.4}}>{a.msg}</div>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,padding:16,marginTop:12}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:'var(--text-primary)'}}>Activity Log</div>
            {logs.length===0 && <div style={{fontSize:12,color:'var(--text-muted)'}}>No activity yet.</div>}
            {logs.map((l,i)=>(
              <div key={i} style={{marginBottom:10,fontSize:12,color:'var(--text-secondary)',borderBottom:'1px solid var(--border-subtle)',paddingBottom:10}}>
                <div style={{color:'var(--text-primary)',marginBottom:2}}>{l.action}</div>
                <div style={{color:'var(--text-muted)',fontSize:11}}>{l.description}</div>
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
console.log('\n✅ Overview done. Cek localhost:3000')
