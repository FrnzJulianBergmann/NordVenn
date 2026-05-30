import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/audit-export.tsx'), 'utf8')

src = src.replace(/NordVen(?!n)/g, 'NordVenn')

writeFileSync(resolve('components/audit-export.tsx'), src, 'utf8')
console.log('✅ Audit export — NordVenn fixed!')
