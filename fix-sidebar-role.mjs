import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

src = src.replace(
  `{user?.user_metadata?.role||'Head of Operations'}`,
  `Admin`
)

writeFileSync(resolve('components/sidebar.tsx'), src, 'utf8')
console.log('✅ Sidebar role hardcoded to Admin')
