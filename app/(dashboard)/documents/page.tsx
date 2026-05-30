'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/components/workspace-provider'
import { toast } from '@/components/toast'
import { TableSkeleton } from '@/components/skeleton'
import Topbar from '@/components/topbar'
import { useConfirm } from '@/components/confirm-dialog'

const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract','Other']

const Badge = ({ s }: { s: string }) => {
  const map: any = { EXPIRED:['#e8403a','#e8403a18'], WARNING:['#e8970a','#e8970a18'], OK:['#0ea871','#0ea87118'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:'0.06em'}}>{s}</span>
}

export default function DocumentsPage() {
  const { workspace } = useWorkspace()
  const { confirm } = useConfirm()
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
    const ok = await confirm({ title: 'Delete Document', message: 'Are you sure you want to delete this document? This action cannot be undone.', danger: true, confirmLabel: 'Delete Document' })
    if(!ok) return
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
