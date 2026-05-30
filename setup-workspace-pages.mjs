import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/(dashboard)/vendors/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import { toast } from '@/components/toast'
import { TableSkeleton } from '@/components/skeleton'
import Topbar from '@/components/topbar'

const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract']

const Badge = ({ s }: { s: string }) => {
  const map: any = { active:['#0ea871','#0ea87118'], pending:['#e8970a','#e8970a18'], inactive:['#44445a','#44445a18'], incomplete:['#e8403a','#e8403a18'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</span>
}

export default function VendorsPage() {
  const { workspace } = useWorkspace()
  const [vendors,setVendors] = useState<any[]>([])
  const [docs,setDocs] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [open,setOpen] = useState(false)
  const [editing,setEditing] = useState<any>(null)
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState('all')
  const [form,setForm] = useState({name:'',email:'',phone:'',category:'',status:'active',required_docs:[] as string[]})
  const [saving,setSaving] = useState(false)

  const load = async () => {
    if(!workspace) return
    setLoading(true)
    const [v,d] = await Promise.all([
      supabase.from('vendors').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}),
      supabase.from('documents').select('vendor_id,type').eq('workspace_id',workspace.id)
    ])
    setVendors(v.data||[]); setDocs(d.data||[]); setLoading(false)
  }

  useEffect(()=>{ load() },[workspace])

  const getMissing = (v: any) => {
    if(!v.required_docs?.length) return []
    const uploaded = docs.filter(d=>d.vendor_id===v.id).map(d=>d.type)
    return v.required_docs.filter((r:string)=>!uploaded.includes(r))
  }

  const filtered = vendors.filter(v=>{
    const matchQ = !search||v.name?.toLowerCase().includes(search.toLowerCase())||v.category?.toLowerCase().includes(search.toLowerCase())
    const missing = getMissing(v)
    const matchF = filter==='all'||v.status===filter||(filter==='incomplete'&&missing.length>0)
    return matchQ&&matchF
  })

  const openAdd = () => { setEditing(null); setForm({name:'',email:'',phone:'',category:'',status:'active',required_docs:[]}); setOpen(true) }
  const openEdit = (v:any) => { setEditing(v); setForm({name:v.name,email:v.email||'',phone:v.phone||'',category:v.category||'',status:v.status,required_docs:v.required_docs||[]}); setOpen(true) }
  const toggleDoc = (t:string) => setForm(p=>({...p,required_docs:p.required_docs.includes(t)?p.required_docs.filter(x=>x!==t):[...p.required_docs,t]}))

  const save = async () => {
    if(!form.name.trim()||!workspace) return
    setSaving(true)
    if(editing) {
      await supabase.from('vendors').update(form).eq('id',editing.id)
      await supabase.from('activity_logs').insert({action:'Vendor updated',description:form.name,workspace_id:workspace.id})
      toast.success('Vendor updated')
    } else {
      await supabase.from('vendors').insert({...form,workspace_id:workspace.id})
      await supabase.from('activity_logs').insert({action:'Vendor added',description:form.name,workspace_id:workspace.id})
      toast.success('Vendor added')
    }
    setSaving(false); setOpen(false); load()
  }

  const del = async (id:string,name:string) => {
    if(!confirm('Delete '+name+'?')||!workspace) return
    await supabase.from('vendors').delete().eq('id',id)
    await supabase.from('activity_logs').insert({action:'Vendor deleted',description:name,workspace_id:workspace.id})
    toast.error('Vendor deleted'); load()
  }

  const inp = (label:string,key:string,type='text') => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}/>
    </div>
  )

  return (
    <>
      <Topbar title="Vendors" subtitle="Manage your vendor list." />
      <div style={{padding:'16px 20px 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 12px',flex:1,maxWidth:280}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..."
              style={{background:'none',border:'none',outline:'none',fontSize:12,color:'var(--text-primary)',width:'100%'}}/>
          </div>
          <div style={{display:'flex',gap:4}}>
            {['all','active','pending','incomplete','inactive'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                background:filter===f?'var(--bg-elevated)':'none',border:'1px solid',
                borderColor:filter===f?'var(--border)':'transparent',
                color:filter===f?'var(--text-primary)':'var(--text-muted)',
                borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',textTransform:'capitalize'
              }}>{f}</button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>{filtered.length} vendors</span>
          <button onClick={openAdd} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,cursor:'pointer',fontWeight:500}}>+ Add Vendor</button>
        </div>

        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                {['Vendor Name','Category','Status','Required Docs','Missing','Actions'].map(h=>(
                  <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading&&<TableSkeleton rows={5} cols={6}/>}
              {!loading&&!filtered.length&&<tr><td colSpan={6} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center'}}>No vendors found.</td></tr>}
              {filtered.map((v,i)=>{
                const missing = getMissing(v)
                return (
                  <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                    <td style={{padding:'11px 14px',fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{v.name}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{v.category||'—'}</td>
                    <td style={{padding:'11px 14px'}}>{missing.length>0?<Badge s="incomplete"/>:<Badge s={v.status}/>}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-muted)',fontSize:11}}>{v.required_docs?.length?v.required_docs.join(', '):'—'}</td>
                    <td style={{padding:'11px 14px',fontSize:11,color:missing.length>0?'var(--danger)':'var(--success)'}}>{missing.length>0?missing.join(', '):v.required_docs?.length?'Complete':'—'}</td>
                    <td style={{padding:'11px 14px'}}>
                      <button onClick={()=>openEdit(v)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11,marginRight:6}}>Edit</button>
                      <button onClick={()=>del(v.id,v.name)} style={{background:'none',border:'1px solid #e8403a33',color:'var(--danger)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11}}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {open&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:24,width:460,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontSize:14,fontWeight:600}}>{editing?'Edit Vendor':'Add Vendor'}</h2>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>
            {inp('Name','name')}{inp('Email','email','email')}{inp('Phone','phone')}{inp('Category','category')}
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Status</label>
              <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}>
                <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.07em'}}>Required Documents</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {DOC_TYPES.map(t=>{
                  const sel=form.required_docs.includes(t)
                  return <button key={t} onClick={()=>toggleDoc(t)} style={{padding:'4px 10px',borderRadius:5,fontSize:11,cursor:'pointer',fontWeight:500,background:sel?'var(--accent)':'var(--bg-elevated)',border:'1px solid',borderColor:sel?'var(--accent)':'var(--border)',color:sel?'#fff':'var(--text-secondary)'}}>{sel?'✓ ':''}{t}</button>
                })}
              </div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
              <button onClick={save} disabled={saving} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500,opacity:saving?0.7:1}}>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
`,

'app/(dashboard)/documents/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import { toast } from '@/components/toast'
import { TableSkeleton } from '@/components/skeleton'
import Topbar from '@/components/topbar'

const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract','Other']

const Badge = ({ s }: { s: string }) => {
  const map: any = { EXPIRED:['#e8403a','#e8403a18'], WARNING:['#e8970a','#e8970a18'], OK:['#0ea871','#0ea87118'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:'0.06em'}}>{s}</span>
}

export default function DocumentsPage() {
  const { workspace } = useWorkspace()
  const [docs,setDocs] = useState<any[]>([])
  const [vendors,setVendors] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [open,setOpen] = useState(false)
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState('all')
  const [form,setForm] = useState({vendor_id:'',name:'',type:'',expiry_date:''})
  const [noExpiry,setNoExpiry] = useState(false)
  const [file,setFile] = useState<File|null>(null)
  const [saving,setSaving] = useState(false)

  const load = async () => {
    if(!workspace) return
    setLoading(true)
    const [d,v] = await Promise.all([
      supabase.from('documents').select('*,vendors(name)').eq('workspace_id',workspace.id).order('created_at',{ascending:false}),
      supabase.from('vendors').select('id,name').eq('workspace_id',workspace.id)
    ])
    setDocs(d.data||[]); setVendors(v.data||[]); setLoading(false)
  }

  useEffect(()=>{ load() },[workspace])

  const now=new Date()
  const in30=new Date();in30.setDate(now.getDate()+30)
  const statusOf=(d:any)=>{
    if(!d.expiry_date) return 'OK'
    const exp=new Date(d.expiry_date)
    if(exp<now) return 'EXPIRED'
    if(exp<=in30) return 'WARNING'
    return 'OK'
  }
  const daysUntil=(date:string)=>Math.ceil((new Date(date).getTime()-now.getTime())/(1000*60*60*24))
  const expired=docs.filter(d=>statusOf(d)==='EXPIRED')

  const filtered=docs.filter(d=>{
    const matchQ=!search||d.name?.toLowerCase().includes(search.toLowerCase())||d.vendors?.name?.toLowerCase().includes(search.toLowerCase())
    const st=statusOf(d)
    const matchF=filter==='all'||(filter==='expired'&&st==='EXPIRED')||(filter==='expiring'&&st==='WARNING')||(filter==='ok'&&st==='OK')
    return matchQ&&matchF
  })

  const save = async () => {
    if(!form.name||!form.vendor_id||!workspace) return
    setSaving(true)
    let file_url=''
    if(file){
      const path=Date.now()+'.'+file.name.split('.').pop()
      const {data}=await supabase.storage.from('documents').upload(path,file)
      if(data) file_url=supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
    }
    await supabase.from('documents').insert({...form,expiry_date:noExpiry?null:form.expiry_date,file_url,workspace_id:workspace.id})
    await supabase.from('activity_logs').insert({action:'Document uploaded',description:form.name,workspace_id:workspace.id})
    toast.success('Document uploaded')
    setSaving(false); setOpen(false); setForm({vendor_id:'',name:'',type:'',expiry_date:''}); setFile(null); setNoExpiry(false); load()
  }

  const del=async(id:string)=>{
    if(!confirm('Delete this document?')) return
    await supabase.from('documents').delete().eq('id',id)
    toast.error('Document deleted'); load()
  }

  const inp=(label:string,key:string,type='text')=>(
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}/>
    </div>
  )

  return (
    <>
      <Topbar title="Documents" subtitle="Manage vendor documents and expiry tracking." />
      <div style={{padding:'16px 20px 28px'}}>
        {expired.length>0&&(
          <div style={{background:'#e8403a12',border:'1px solid #e8403a33',borderRadius:8,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--danger)',flexShrink:0}}/>
            <span style={{fontSize:12,color:'var(--danger)',fontWeight:500}}>{expired.length} document{expired.length>1?'s':''} expired — immediate action required</span>
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 12px',flex:1,maxWidth:280}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents..."
              style={{background:'none',border:'none',outline:'none',fontSize:12,color:'var(--text-primary)',width:'100%'}}/>
          </div>
          <div style={{display:'flex',gap:4}}>
            {[['all','All'],['expired','Expired'],['expiring','Expiring'],['ok','OK']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{background:filter===v?'var(--bg-elevated)':'none',border:'1px solid',borderColor:filter===v?'var(--border)':'transparent',color:filter===v?'var(--text-primary)':'var(--text-muted)',borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer'}}>{l}</button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>{filtered.length} documents</span>
          <button onClick={()=>setOpen(true)} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,cursor:'pointer',fontWeight:500}}>+ Upload Document</button>
        </div>

        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                {['Document','Vendor','Type','Expiry','Expires In','Status',''].map(h=>(
                  <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading&&<TableSkeleton rows={5} cols={7}/>}
              {!loading&&!filtered.length&&<tr><td colSpan={7} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center'}}>No documents found.</td></tr>}
              {filtered.map((d,i)=>{
                const st=statusOf(d)
                const days=d.expiry_date?daysUntil(d.expiry_date):null
                return (
                  <tr key={d.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                    <td style={{padding:'11px 14px',fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{d.name}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{d.vendors?.name||'—'}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-muted)',fontSize:11,textTransform:'uppercase'}}>{d.type||'—'}</td>
                    <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{d.expiry_date||'No expiry'}</td>
                    <td style={{padding:'11px 14px',fontSize:12,fontWeight:500,color:st==='EXPIRED'?'var(--danger)':st==='WARNING'?'var(--warning)':'var(--text-muted)'}}>{days===null?'—':days<0?'Expired':days+' days'}</td>
                    <td style={{padding:'11px 14px'}}><Badge s={st}/></td>
                    <td style={{padding:'11px 14px',display:'flex',gap:6}}>
                      {d.file_url&&<a href={d.file_url} target="_blank" style={{color:'var(--accent)',fontSize:11,border:'1px solid var(--border)',borderRadius:5,padding:'3px 8px',textDecoration:'none'}}>View</a>}
                      <button onClick={()=>del(d.id)} style={{background:'none',border:'1px solid #e8403a33',color:'var(--danger)',borderRadius:5,padding:'3px 8px',cursor:'pointer',fontSize:11}}>Del</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {open&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:24,width:420}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontSize:14,fontWeight:600}}>Upload Document</h2>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Vendor</label>
              <select value={form.vendor_id} onChange={e=>setForm(p=>({...p,vendor_id:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:form.vendor_id?'var(--text-primary)':'var(--text-muted)',fontSize:13,outline:'none'}}>
                <option value="">Select vendor...</option>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            {inp('Document Name','name')}
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:form.type?'var(--text-primary)':'var(--text-muted)',fontSize:13,outline:'none'}}>
                <option value="">Select type...</option>
                {DOC_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em'}}>Expiry Date</label>
                <label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:11,color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={noExpiry} onChange={e=>{setNoExpiry(e.target.checked);if(e.target.checked)setForm(p=>({...p,expiry_date:''}))}} style={{accentColor:'var(--accent)',cursor:'pointer'}}/>
                  No expiration
                </label>
              </div>
              <input type="date" value={form.expiry_date} disabled={noExpiry} onChange={e=>setForm(p=>({...p,expiry_date:e.target.value}))}
                style={{width:'100%',background:noExpiry?'var(--bg-base)':'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:noExpiry?'var(--text-muted)':'var(--text-primary)',fontSize:13,outline:'none',opacity:noExpiry?0.5:1}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>File (PDF / Image)</label>
              <input type="file" accept=".pdf,image/*" onChange={e=>setFile(e.target.files?.[0]||null)} style={{fontSize:12,color:'var(--text-secondary)',width:'100%'}}/>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
              <button onClick={save} disabled={saving} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500,opacity:saving?0.7:1}}>{saving?'Uploading...':'Upload'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
`,

'app/(dashboard)/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import Topbar from '@/components/topbar'
import { CardSkeleton, TableSkeleton } from '@/components/skeleton'
import Link from 'next/link'

const Badge = ({ s }: { s: string }) => {
  const map: any = { active:['#0ea871','#0ea87118'], pending:['#e8970a','#e8970a18'], inactive:['#44445a','#44445a18'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</span>
}

const Icon = ({ d, color }: { d: string; color: string }) => (
  <div style={{width:32,height:32,borderRadius:8,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d={d}/></svg>
  </div>
)

export default function OverviewPage() {
  const { workspace } = useWorkspace()
  const [vendors,setVendors] = useState<any[]>([])
  const [docs,setDocs] = useState<any[]>([])
  const [logs,setLogs] = useState<any[]>([])
  const [ready,setReady] = useState(false)

  useEffect(()=>{
    if(!workspace) return
    setReady(false)
    Promise.all([
      supabase.from('vendors').select('*').eq('workspace_id',workspace.id).then(r=>setVendors(r.data||[])),
      supabase.from('documents').select('*,vendors(name)').eq('workspace_id',workspace.id).then(r=>setDocs(r.data||[])),
      supabase.from('activity_logs').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(10).then(r=>setLogs(r.data||[])),
    ]).then(()=>setReady(true))
  },[workspace])

  const now=new Date()
  const in30=new Date();in30.setDate(now.getDate()+30)
  const expired=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<now)
  const expiring=docs.filter(d=>d.expiry_date&&new Date(d.expiry_date)<=in30&&new Date(d.expiry_date)>=now)
  const daysUntil=(date:string)=>Math.ceil((new Date(date).getTime()-now.getTime())/(1000*60*60*24))

  const metrics=[
    {label:'Total Vendors',value:vendors.length,sub:'All time',color:'#5b5ef4',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'},
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

  const card={background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8}

  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{padding:'16px 20px 28px',display:'grid',gridTemplateColumns:'1fr 230px',gap:16}}>
        <div>
          {!ready?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {Array.from({length:6}).map((_,i)=><CardSkeleton key={i}/>)}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {metrics.map(m=>(
                <div key={m.label} style={{...card,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{m.label}</div>
                    <Icon d={m.icon} color={m.color}/>
                  </div>
                  <div style={{fontSize:28,fontWeight:700,color:m.color,lineHeight:1}}>{m.value}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{...card,overflow:'hidden',marginBottom:16}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>Recent Vendors</span>
              <Link href="/vendors" style={{fontSize:11,color:'var(--accent)',textDecoration:'none'}}>View all →</Link>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                {['Vendor Name','Category','Status','Created'].map(h=>(
                  <th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {!ready&&<TableSkeleton rows={4} cols={4}/>}
                {ready&&vendors.slice(0,5).map((v,i)=>(
                  <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)'}}>
                    <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{v.name}</td>
                    <td style={{padding:'10px 14px',color:'var(--text-secondary)',fontSize:13}}>{v.category||'—'}</td>
                    <td style={{padding:'10px 14px'}}><Badge s={v.status}/></td>
                    <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:11}}>{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {ready&&!vendors.length&&<tr><td colSpan={4} style={{padding:'20px 14px',color:'var(--text-muted)',fontSize:13,textAlign:'center'}}>No vendors yet — <Link href="/vendors" style={{color:'var(--accent)'}}>add one</Link></td></tr>}
              </tbody>
            </table>
          </div>

          <div style={{...card,overflow:'hidden'}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>Documents Expiring Soon</span>
              <Link href="/documents" style={{fontSize:11,color:'var(--accent)',textDecoration:'none'}}>View all →</Link>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
                {['Vendor','Document','Type','Expires In','Status'].map(h=>(
                  <th key={h} style={{padding:'8px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {!ready&&<TableSkeleton rows={3} cols={5}/>}
                {ready&&[...expiring,...expired].slice(0,5).map((d,i)=>{
                  const days=daysUntil(d.expiry_date)
                  const isExp=days<0
                  return (
                    <tr key={d.id} style={{borderBottom:'1px solid var(--border-subtle)'}}>
                      <td style={{padding:'10px 14px',color:'var(--text-secondary)',fontSize:13}}>{d.vendors?.name||'—'}</td>
                      <td style={{padding:'10px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{d.name}</td>
                      <td style={{padding:'10px 14px',color:'var(--text-muted)',fontSize:11,textTransform:'uppercase'}}>{d.type||'—'}</td>
                      <td style={{padding:'10px 14px',fontSize:12,fontWeight:500,color:isExp?'var(--danger)':'var(--warning)'}}>{isExp?'Expired':days+' days'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{color:isExp?'var(--danger)':'var(--warning)',background:(isExp?'var(--danger)':'var(--warning)')+'18',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700}}>{isExp?'EXPIRED':'WARNING'}</span>
                      </td>
                    </tr>
                  )
                })}
                {ready&&!expiring.length&&!expired.length&&<tr><td colSpan={5} style={{padding:'20px 14px',color:'var(--text-muted)',fontSize:13,textAlign:'center'}}>No expiring documents</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{...card,padding:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              Alerts {alerts.length>0&&<span style={{background:'var(--danger)',color:'#fff',fontSize:9,fontWeight:700,borderRadius:10,padding:'1px 6px'}}>{alerts.length}</span>}
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
            {[{label:'Add Vendor',href:'/vendors'},{label:'Upload Document',href:'/documents'},{label:'View Activity Log',href:'/activity'}].map(a=>(
              <Link key={a.label} href={a.href} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px',borderRadius:6,marginBottom:4,textDecoration:'none',fontSize:12,color:'var(--text-secondary)',background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)'}}>
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

'app/(dashboard)/activity/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import Topbar from '@/components/topbar'
import { TableSkeleton } from '@/components/skeleton'

export default function ActivityPage() {
  const { workspace } = useWorkspace()
  const [logs,setLogs] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    if(!workspace) return
    supabase.from('activity_logs').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(50)
      .then(r=>{ setLogs(r.data||[]); setLoading(false) })
  },[workspace])

  return (
    <>
      <Topbar title="Activity Log" subtitle="All recent actions across your workspace." />
      <div style={{padding:'16px 20px 28px'}}>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid var(--border-subtle)'}}>
              {['Action','Description','Time'].map(h=>(
                <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading&&<TableSkeleton rows={6} cols={3}/>}
              {!loading&&!logs.length&&<tr><td colSpan={3} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center'}}>No activity yet.</td></tr>}
              {logs.map((l,i)=>(
                <tr key={l.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                  <td style={{padding:'11px 14px',fontWeight:500,color:'var(--text-primary)',fontSize:13}}>{l.action}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{l.description||'—'}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-muted)',fontSize:11}}>{new Date(l.created_at).toLocaleString()}</td>
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
console.log('\n✅ All pages updated with workspace support.')
