import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract']

const files = {
'app/(dashboard)/vendors/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  const params = useSearchParams()
  const [vendors,setVendors] = useState<any[]>([])
  const [docs,setDocs] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [open,setOpen] = useState(false)
  const [editing,setEditing] = useState<any|null>(null)
  const [search,setSearch] = useState(params.get('q')||'')
  const [filter,setFilter] = useState('all')
  const [form,setForm] = useState({name:'',email:'',phone:'',category:'',status:'active',required_docs:[] as string[]})
  const [saving,setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [v,d] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at',{ascending:false}),
      supabase.from('documents').select('vendor_id,type')
    ])
    setVendors(v.data||[]); setDocs(d.data||[]); setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const getMissing = (v: any) => {
    if(!v.required_docs?.length) return []
    const uploaded = docs.filter(d=>d.vendor_id===v.id).map(d=>d.type)
    return v.required_docs.filter((r:string) => !uploaded.includes(r))
  }

  const filtered = vendors.filter(v => {
    const matchQ = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.category?.toLowerCase().includes(search.toLowerCase())
    const missing = getMissing(v)
    const matchF = filter==='all' || v.status===filter || (filter==='incomplete'&&missing.length>0)
    return matchQ && matchF
  })

  const openAdd = () => { setEditing(null); setForm({name:'',email:'',phone:'',category:'',status:'active',required_docs:[]}); setOpen(true) }
  const openEdit = (v:any) => { setEditing(v); setForm({name:v.name,email:v.email||'',phone:v.phone||'',category:v.category||'',status:v.status,required_docs:v.required_docs||[]}); setOpen(true) }

  const toggleDoc = (t: string) => setForm(p=>({...p,required_docs:p.required_docs.includes(t)?p.required_docs.filter(x=>x!==t):[...p.required_docs,t]}))

  const save = async () => {
    if(!form.name.trim()) return
    setSaving(true)
    if(editing) {
      await supabase.from('vendors').update(form).eq('id',editing.id)
      await supabase.from('activity_logs').insert({action:'Vendor updated',description:form.name})
      toast.success('Vendor updated')
    } else {
      await supabase.from('vendors').insert(form)
      await supabase.from('activity_logs').insert({action:'Vendor added',description:form.name})
      toast.success('Vendor added')
    }
    setSaving(false); setOpen(false); load()
  }

  const del = async (id:string,name:string) => {
    if(!confirm('Delete '+name+'?')) return
    await supabase.from('vendors').delete().eq('id',id)
    await supabase.from('activity_logs').insert({action:'Vendor deleted',description:name})
    toast.error('Vendor deleted'); load()
  }

  const inp = (label:string, key:string, type='text') => (
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
                    <td style={{padding:'11px 14px'}}>
                      {missing.length>0 ? <Badge s="incomplete"/> : <Badge s={v.status}/>}
                    </td>
                    <td style={{padding:'11px 14px',color:'var(--text-muted)',fontSize:11}}>{v.required_docs?.length?v.required_docs.join(', '):'—'}</td>
                    <td style={{padding:'11px 14px'}}>
                      {missing.length>0
                        ? <span style={{color:'var(--danger)',fontSize:11}}>{missing.join(', ')}</span>
                        : <span style={{color:'var(--success)',fontSize:11}}>{v.required_docs?.length?'Complete':'—'}</span>
                      }
                    </td>
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
            {inp('Name','name')}
            {inp('Email','email','email')}
            {inp('Phone','phone')}
            {inp('Category','category')}
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Status</label>
              <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.07em'}}>Required Documents</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {DOC_TYPES.map(t=>{
                  const sel = form.required_docs.includes(t)
                  return (
                    <button key={t} onClick={()=>toggleDoc(t)} style={{
                      padding:'4px 10px',borderRadius:5,fontSize:11,cursor:'pointer',fontWeight:500,
                      background:sel?'var(--accent)':'var(--bg-elevated)',
                      border:'1px solid',borderColor:sel?'var(--accent)':'var(--border)',
                      color:sel?'#fff':'var(--text-secondary)',
                    }}>{t}</button>
                  )
                })}
              </div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>Vendor will show as INCOMPLETE if these are missing.</div>
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
}

for (const [f,c] of Object.entries(files)) {
  const full = join(base,f)
  mkdirSync(dirname(full),{recursive:true})
  writeFileSync(full,c,'utf8')
  console.log('✓',f)
}
console.log('\n✅ Required docs done.')
