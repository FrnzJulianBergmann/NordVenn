import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/(dashboard)/vendors/page.tsx': `'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Vendor } from '@/types/vendor'
import Topbar from '@/components/topbar'

const Badge = ({ s }: { s: string }) => {
  const map: any = { active:['#0ea871','#0ea87118'], pending:['#e8970a','#e8970a18'], inactive:['#44445a','#44445a18'] }
  const [c,bg] = map[s]||['#44445a','#44445a18']
  return <span style={{color:c,background:bg,padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s}</span>
}

export default function VendorsPage() {
  const params = useSearchParams()
  const [vendors,setVendors] = useState<Vendor[]>([])
  const [loading,setLoading] = useState(true)
  const [open,setOpen] = useState(false)
  const [editing,setEditing] = useState<Vendor|null>(null)
  const [search,setSearch] = useState(params.get('q')||'')
  const [filter,setFilter] = useState('all')
  const [form,setForm] = useState({name:'',email:'',phone:'',category:'',status:'active'})
  const [saving,setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('vendors').select('*').order('created_at',{ascending:false})
    setVendors(data||[]); setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const filtered = vendors.filter(v => {
    const matchQ = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.category?.toLowerCase().includes(search.toLowerCase()) || v.email?.toLowerCase().includes(search.toLowerCase())
    const matchF = filter==='all' || v.status===filter
    return matchQ && matchF
  })

  const openAdd = () => { setEditing(null); setForm({name:'',email:'',phone:'',category:'',status:'active'}); setOpen(true) }
  const openEdit = (v:Vendor) => { setEditing(v); setForm({name:v.name,email:v.email||'',phone:v.phone||'',category:v.category||'',status:v.status}); setOpen(true) }

  const save = async () => {
    if(!form.name.trim()) return
    setSaving(true)
    if(editing) await supabase.from('vendors').update(form).eq('id',editing.id)
    else {
      await supabase.from('vendors').insert(form)
      await supabase.from('activity_logs').insert({action:'Vendor added',description:form.name})
    }
    setSaving(false); setOpen(false); load()
  }

  const del = async (id:string,name:string) => {
    if(!confirm('Delete '+name+'?')) return
    await supabase.from('vendors').delete().eq('id',id); load()
  }

  const inp = (label:string, key:string, type='text') => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}} />
    </div>
  )

  const card = {background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:8}

  return (
    <>
      <Topbar title="Vendors" subtitle="Manage your vendor list." />
      <div style={{padding:'16px 20px 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 12px',flex:1,maxWidth:280}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..."
              style={{background:'none',border:'none',outline:'none',fontSize:12,color:'var(--text-primary)',width:'100%'}} />
          </div>
          <div style={{display:'flex',gap:4}}>
            {['all','active','pending','inactive'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                background:filter===f?'var(--bg-elevated)':'none',
                border:'1px solid',borderColor:filter===f?'var(--border)':'transparent',
                color:filter===f?'var(--text-primary)':'var(--text-muted)',
                borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',textTransform:'capitalize'
              }}>{f}</button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <div style={{fontSize:12,color:'var(--text-muted)'}}>{filtered.length} vendors</div>
          <button onClick={openAdd} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,cursor:'pointer',fontWeight:500}}>+ Add Vendor</button>
        </div>

        <div style={{...card,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg-surface)',borderBottom:'1px solid var(--border-subtle)'}}>
                {['Vendor Name','Email','Phone','Category','Status','Actions'].map(h=>(
                  <th key={h} style={{padding:'9px 14px',textAlign:'left',color:'var(--text-muted)',fontWeight:500,fontSize:10,textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading&&<tr><td colSpan={6} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center',fontSize:13}}>Loading...</td></tr>}
              {!loading&&!filtered.length&&<tr><td colSpan={6} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center',fontSize:13}}>No vendors found.</td></tr>}
              {filtered.map((v,i)=>(
                <tr key={v.id} style={{borderBottom:'1px solid var(--border-subtle)',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                  <td style={{padding:'11px 14px',fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{v.name}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{v.email||'—'}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{v.phone||'—'}</td>
                  <td style={{padding:'11px 14px',color:'var(--text-secondary)',fontSize:12}}>{v.category||'—'}</td>
                  <td style={{padding:'11px 14px'}}><Badge s={v.status}/></td>
                  <td style={{padding:'11px 14px'}}>
                    <button onClick={()=>openEdit(v)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11,marginRight:6}}>Edit</button>
                    <button onClick={()=>del(v.id,v.name)} style={{background:'none',border:'1px solid #e8403a33',color:'var(--danger)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:24,width:420}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontSize:14,fontWeight:600}}>{editing?'Edit Vendor':'Add Vendor'}</h2>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>
            {inp('Name','name')}
            {inp('Email','email','email')}
            {inp('Phone','phone')}
            {inp('Category','category')}
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Status</label>
              <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:'var(--text-primary)',fontSize:13,outline:'none'}}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
              <button onClick={save} disabled={saving} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:500}}>{saving?'Saving...':'Save'}</button>
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
console.log('\n✅ Vendors v2 done.')
