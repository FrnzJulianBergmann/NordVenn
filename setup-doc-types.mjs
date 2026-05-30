import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const path = join(base, 'app/(dashboard)/documents/page.tsx')
let src = readFileSync(path, 'utf8')

// Add DOC_TYPES constant after imports
src = src.replace(
  `const Badge`,
  `const DOC_TYPES = ['Insurance','License','W9','NDA','SOC2','Permit','Contract','Other']

const Badge`
)

// Replace type text input with dropdown
src = src.replace(
  `{inp('Type (Insurance, License, etc)','type')}`,
  `<div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 10px',color:form.type?'var(--text-primary)':'var(--text-muted)',fontSize:13,outline:'none'}}>
                <option value="">Select type...</option>
                {DOC_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>`
)

writeFileSync(path, src, 'utf8')
console.log('✓ documents/page.tsx — type dropdown added')
console.log('\n✅ Done. Refresh browser.')
