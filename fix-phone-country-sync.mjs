import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/settings/page.tsx'), 'utf8')

// Add useEffect to sync sel when value changes from outside
src = src.replace(
  `  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])`,
  `  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Sync country selector when value loads from Supabase
  React.useEffect(() => {
    const found = COUNTRIES.find(c => value.startsWith(c.dial + ' '))
    if (found) setSel(found)
  }, [value])`
)

writeFileSync(resolve('app/(dashboard)/settings/page.tsx'), src, 'utf8')
console.log('✅ Phone country selector sync fixed!')
