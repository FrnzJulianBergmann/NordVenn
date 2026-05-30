import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

// Patch vendors page - replace loading state
const vendorsPath = join(base, 'app/(dashboard)/vendors/page.tsx')
let vendors = readFileSync(vendorsPath, 'utf8')

// Add import
vendors = vendors.replace(
  `import Topbar from '@/components/topbar'`,
  `import Topbar from '@/components/topbar'\nimport { TableSkeleton } from '@/components/skeleton'`
)

// Replace loading row with skeleton
vendors = vendors.replace(
  `{loading&&<tr><td colSpan={6} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center'}}>Loading...</td></tr>}`,
  `{loading&&<TableSkeleton rows={5} cols={6}/>}`
)

writeFileSync(vendorsPath, vendors, 'utf8')
console.log('✓ vendors page patched')

// Patch documents page
const docsPath = join(base, 'app/(dashboard)/documents/page.tsx')
let docs = readFileSync(docsPath, 'utf8')

docs = docs.replace(
  `import Topbar from '@/components/topbar'`,
  `import Topbar from '@/components/topbar'\nimport { TableSkeleton } from '@/components/skeleton'`
)

docs = docs.replace(
  `{loading&&<tr><td colSpan={7} style={{padding:'24px',color:'var(--text-muted)',textAlign:'center'}}>Loading...</td></tr>}`,
  `{loading&&<TableSkeleton rows={5} cols={7}/>}`
)

writeFileSync(docsPath, docs, 'utf8')
console.log('✓ documents page patched')

// Patch overview page - replace metric cards loading
const overviewPath = join(base, 'app/(dashboard)/page.tsx')
let overview = readFileSync(overviewPath, 'utf8')

overview = overview.replace(
  `import Topbar from '@/components/topbar'`,
  `import Topbar from '@/components/topbar'\nimport { CardSkeleton, TableSkeleton } from '@/components/skeleton'`
)

overview = overview.replace(
  `const [vendors,setVendors]=useState<any[]>([])
  const [docs,setDocs]=useState<any[]>([])
  const [logs,setLogs]=useState<any[]>([])`,
  `const [vendors,setVendors]=useState<any[]>([])
  const [docs,setDocs]=useState<any[]>([])
  const [logs,setLogs]=useState<any[]>([])
  const [ready,setReady]=useState(false)`
)

overview = overview.replace(
  `supabase.from('vendors').select('*').then(r=>setVendors(r.data||[]))
    supabase.from('documents').select('*,vendors(name)').then(r=>setDocs(r.data||[]))
    supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(10).then(r=>setLogs(r.data||[]))`,
  `Promise.all([
      supabase.from('vendors').select('*').then(r=>setVendors(r.data||[])),
      supabase.from('documents').select('*,vendors(name)').then(r=>setDocs(r.data||[])),
      supabase.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(10).then(r=>setLogs(r.data||[])),
    ]).then(()=>setReady(true))`
)

// Add skeleton grid before metric cards render
overview = overview.replace(
  `          {/* Metric Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {metrics.map(m=>(`,
  `          {/* Metric Cards */}
          {!ready ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {Array.from({length:6}).map((_,i)=><CardSkeleton key={i}/>)}
            </div>
          ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {metrics.map(m=>(`
)

// Close the conditional
overview = overview.replace(
  `          </div>

          {/* Recent Vendors */}`,
  `          </div>
          )}

          {/* Recent Vendors */}`
)

writeFileSync(overviewPath, overview, 'utf8')
console.log('✓ overview page patched')
console.log('\n✅ Skeleton integration done. Refresh browser.')
