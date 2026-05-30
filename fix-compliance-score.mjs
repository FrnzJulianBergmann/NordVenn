import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const TARGET = resolve('app/(dashboard)/page.tsx')
let src = readFileSync(TARGET, 'utf8')

src = src.replace('        {{/* Right Panel */}}', '        {/* Right Panel */}')

writeFileSync(TARGET, src, 'utf8')
console.log('✅ Fixed! Double curly brace removed.')
