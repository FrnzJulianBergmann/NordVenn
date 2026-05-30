'use client'
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
