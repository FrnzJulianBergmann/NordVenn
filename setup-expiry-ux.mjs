import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const path = join(base, 'app/(dashboard)/documents/page.tsx')
let src = readFileSync(path, 'utf8')

// Add noExpiry state
src = src.replace(
  `const [saving,setSaving] = useState(false)`,
  `const [saving,setSaving] = useState(false)
  const [noExpiry,setNoExpiry] = useState(false)`
)

// Reset noExpiry on open
src = src.replace(
  `setForm({vendor_id:'',name:'',type:'',expiry_date:''}); setFile(null); load()`,
  `setForm({vendor_id:'',name:'',type:'',expiry_date:''}); setFile(null); setNoExpiry(false); load()`
)

// Replace expiry date input with expiry + checkbox
src = src.replace(
  `{inp('Expiry Date','expiry_date','date')}`,
  `<div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em'}}>Expiry Date</label>
                <label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:11,color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={noExpiry} onChange={e=>{setNoExpiry(e.target.checked);if(e.target.checked)setForm(p=>({...p,expiry_date:''}))}}
                    style={{accentColor:'var(--accent)',cursor:'pointer'}}/>
                  No expiration
                </label>
              </div>
              <input type="date" value={form.expiry_date} disabled={noExpiry}
                onChange={e=>setForm(p=>({...p,expiry_date:e.target.value}))}
                style={{width:'100%',background:noExpiry?'var(--bg-base)':'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:noExpiry?'var(--text-muted)':'var(--text-primary)',fontSize:13,outline:'none',opacity:noExpiry?0.5:1,cursor:noExpiry?'not-allowed':'text'}}/>
            </div>`
)

writeFileSync(path, src, 'utf8')
console.log('✓ expiry UX updated')
console.log('\n✅ Done. Refresh browser.')
