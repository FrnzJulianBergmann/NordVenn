import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/(dashboard)/documents/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ vendor_id:'', name:'', type:'', expiry_date:'' })
  const [file, setFile] = useState<File|null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [d,v] = await Promise.all([
      supabase.from('documents').select('*, vendors(name)').order('created_at',{ascending:false}),
      supabase.from('vendors').select('id,name')
    ])
    setDocs(d.data||[]); setVendors(v.data||[]); setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const save = async () => {
    if(!form.name||!form.vendor_id) return
    setSaving(true)
    let file_url = ''
    if(file) {
      const ext = file.name.split('.').pop()
      const path = \`\${Date.now()}.\${ext}\`
      const { data } = await supabase.storage.from('documents').upload(path, file)
      if(data) {
        const { data: url } = supabase.storage.from('documents').getPublicUrl(path)
        file_url = url.publicUrl
      }
    }
    await supabase.from('documents').insert({ ...form, file_url })
    await supabase.from('activity_logs').insert({ action:'Document uploaded', description: form.name })
    setSaving(false); setOpen(false); setForm({vendor_id:'',name:'',type:'',expiry_date:''}); setFile(null); load()
  }

  const del = async (id:string) => {
    await supabase.from('documents').delete().eq('id',id); load()
  }

  const now = new Date()
  const statusOf = (d:any) => {
    if(!d.expiry_date) return null
    const exp = new Date(d.expiry_date)
    const in30 = new Date(); in30.setDate(now.getDate()+30)
    if(exp < now) return ['EXPIRED','#ef4444']
    if(exp <= in30) return ['EXPIRING','#f59e0b']
    return ['OK','#10b981']
  }

  const inp = (label:string, key:string, type='text') => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:11,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase'}}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}} />
    </div>
  )

  return (
    <>
      <Topbar title="Documents" subtitle="Manage vendor documents and expiry dates." />
      <div style={{padding:'0 28px 28px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <div style={{fontSize:13,color:'var(--text-muted)'}}>{docs.length} documents</div>
          <button onClick={()=>setOpen(true)} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:500}}>+ Upload Document</button>
        </div>

        <div style={{border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'var(--bg-surface)',borderBottom:'1px solid var(--border-subtle)'}}>
                {['Document','Vendor','Type','Expiry','Status',''].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:11,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{padding:'16px 14px',color:'var(--text-muted)'}}>Loading...</td></tr>}
              {!loading && !docs.length && <tr><td colSpan={6} style={{padding:'16px 14px',color:'var(--text-muted)'}}>No documents yet.</td></tr>}
              {docs.map((d,i)=>{
                const st = statusOf(d)
                return (
                  <tr key={d.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'var(--bg-base)':'var(--bg-surface)'}}>
                    <td style={{padding:'11px 14px',fontWeight:500,color:'var(--text-primary)'}}>{d.name}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)'}}>{d.vendors?.name||'—'}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)'}}>{d.type||'—'}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)'}}>{d.expiry_date||'—'}</td>
                    <td style={{padding:'11px 14px'}}>
                      {st && <span style={{color:st[1],background:st[1]+'22',padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600}}>{st[0]}</span>}
                    </td>
                    <td style={{padding:'11px 14px'}}>
                      {d.file_url && <a href={d.file_url} target="_blank" style={{color:'var(--accent)',fontSize:12,marginRight:8}}>View</a>}
                      <button onClick={()=>del(d.id)} style={{background:'none',border:'1px solid #ef444433',color:'var(--danger)',borderRadius:4,padding:'3px 8px',cursor:'pointer',fontSize:12}}>Del</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {open && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:24,width:420}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
                <h2 style={{fontSize:15,fontWeight:600}}>Upload Document</h2>
                <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:18}}>×</button>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:11,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase'}}>Vendor</label>
                <select value={form.vendor_id} onChange={e=>setForm(p=>({...p,vendor_id:e.target.value}))}
                  style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}>
                  <option value="">Select vendor...</option>
                  {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              {inp('Document Name','name')}
              {inp('Type (e.g. Insurance, License)','type')}
              {inp('Expiry Date','expiry_date','date')}
              <div style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:11,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase'}}>File (PDF/Image)</label>
                <input type="file" accept=".pdf,image/*" onChange={e=>setFile(e.target.files?.[0]||null)}
                  style={{width:'100%',fontSize:13,color:'var(--text-secondary)'}} />
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button onClick={()=>setOpen(false)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
                <button onClick={save} disabled={saving} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500}}>{saving?'Saving...':'Upload'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
`,

'app/(dashboard)/activity/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/topbar'

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(50)
      .then(r=>{ setLogs(r.data||[]); setLoading(false) })
  },[])

  return (
    <>
      <Topbar title="Activity Log" subtitle="All recent actions across your workspace." />
      <div style={{padding:'0 28px 28px'}}>
        <div style={{border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'var(--bg-surface)',borderBottom:'1px solid var(--border-subtle)'}}>
                {['Action','Description','Time'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:11,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} style={{padding:'16px 14px',color:'var(--text-muted)'}}>Loading...</td></tr>}
              {!loading && !logs.length && <tr><td colSpan={3} style={{padding:'16px 14px',color:'var(--text-muted)'}}>No activity yet.</td></tr>}
              {logs.map((l,i)=>(
                <tr key={l.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'var(--bg-base)':'var(--bg-surface)'}}>
                  <td style={{padding:'11px 14px',fontWeight:500,color:'var(--text-primary)'}}>{l.action}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-secondary)'}}>{l.description||'—'}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-muted)',fontSize:12}}>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
console.log('\n✅ Documents + Activity done.')
