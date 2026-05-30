import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve('app/(dashboard)/layout.tsx')
let src = readFileSync(path, 'utf8')

src = src.replace(
  `marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)'`,
  `marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)', borderRadius: '10px 0 0 10px', overflow: 'hidden'`
)

writeFileSync(path, src, 'utf8')
console.log('✅ Main content area — soft edge applied')
