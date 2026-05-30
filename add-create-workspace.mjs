import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

// 1. Add workspace state from localStorage
src = src.replace(
  `  const [wsOpen, setWsOpen] = useState(false)
  const [activeWs, setActiveWs] = useState(WORKSPACES[0])`,
  `  const [wsOpen, setWsOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [wsName, setWsName] = useState('')
  const [wsError, setWsError] = useState('')
  const [extraWs, setExtraWs] = useState<typeof WORKSPACES>([])
  const [activeWs, setActiveWs] = useState(WORKSPACES[0])`
)

// 2. Load extra workspaces from localStorage on mount
src = src.replace(
  `  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])`,
  `  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
    try {
      const saved = localStorage.getItem('nordvenn_workspaces')
      if (saved) setExtraWs(JSON.parse(saved))
    } catch {}
  }, [])`
)

// 3. Replace WORKSPACES list render with [...WORKSPACES, ...extraWs]
src = src.replace(
  `              {WORKSPACES.map(ws => {`,
  `              {[...WORKSPACES, ...extraWs].map(ws => {`
)

// 4. Replace "Create Workspace" button to open modal
src = src.replace(
  `                <button onClick={() => setWsOpen(false)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:8,
                  padding:'7px 8px', borderRadius:6, border:'none', cursor:'pointer',
                  background:'transparent', color:'var(--accent)', fontSize:12, fontWeight:500,
                }}>
                  <div style={{width:22,height:22,borderRadius:6,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                  Create Workspace
                </button>`,
  `                <button onClick={() => { setWsOpen(false); setCreateOpen(true) }} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:8,
                  padding:'7px 8px', borderRadius:6, border:'none', cursor:'pointer',
                  background:'transparent', color:'var(--accent)', fontSize:12, fontWeight:500,
                }}>
                  <div style={{width:22,height:22,borderRadius:6,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                  Create Workspace
                </button>`
)

// 5. Add modal before closing </aside>
src = src.replace(
  `    </aside>
  )
}`,
  `      {/* Create Workspace Modal */}
      {createOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={e => { if (e.target === e.currentTarget) { setCreateOpen(false); setWsName(''); setWsError('') } }}>
          <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:12,padding:24,width:340}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>New Workspace</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>Personal workspace</div>
              </div>
              <button onClick={() => { setCreateOpen(false); setWsName(''); setWsError('') }}
                style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>

            <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Workspace Name</label>
            <input
              value={wsName}
              onChange={e => { setWsName(e.target.value); setWsError('') }}
              onKeyDown={e => e.key === 'Enter' && (() => {
                if (!wsName.trim()) { setWsError('Name is required'); return }
                const newWs = { id: 'ws-' + Date.now(), name: wsName.trim(), badge: 'Personal', color: '#4C6FFF' }
                const updated = [...extraWs, newWs]
                setExtraWs(updated)
                localStorage.setItem('nordvenn_workspaces', JSON.stringify(updated))
                setActiveWs(newWs)
                setCreateOpen(false)
                setWsName('')
              })()}
              placeholder="e.g. Acme Corp"
              autoFocus
              style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:7,padding:'9px 12px',color:'var(--text-primary)',fontSize:13,outline:'none',marginBottom:wsError?8:16}}
            />
            {wsError && <div style={{fontSize:11,color:'var(--danger)',marginBottom:12}}>{wsError}</div>}

            <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)',borderRadius:7,padding:'10px 12px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:22,height:22,borderRadius:6,background:'#4C6FFF22',border:'1px solid #4C6FFF44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#4C6FFF',flexShrink:0}}>
                {wsName ? wsName.charAt(0).toUpperCase() : 'W'}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{wsName || 'Workspace name'}</div>
                <div style={{fontSize:10,marginTop:1}}><span style={{color:'#7AA2FF',background:'#4C6FFF18',padding:'0 5px',borderRadius:3,fontWeight:700,fontSize:9}}>Personal</span></div>
              </div>
            </div>

            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { setCreateOpen(false); setWsName(''); setWsError('') }}
                style={{flex:1,background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',borderRadius:7,padding:'9px',fontSize:12,cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={() => {
                if (!wsName.trim()) { setWsError('Name is required'); return }
                const newWs = { id: 'ws-' + Date.now(), name: wsName.trim(), badge: 'Personal', color: '#4C6FFF' }
                const updated = [...extraWs, newWs]
                setExtraWs(updated)
                localStorage.setItem('nordvenn_workspaces', JSON.stringify(updated))
                setActiveWs(newWs)
                setCreateOpen(false)
                setWsName('')
              }} style={{flex:1,background:'var(--accent)',color:'#fff',border:'none',borderRadius:7,padding:'9px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}`
)

writeFileSync(resolve('components/sidebar.tsx'), src, 'utf8')
console.log('✅ Create Workspace modal added!')
