import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve('app/(dashboard)/layout.tsx')
let src = readFileSync(path, 'utf8')

// Remove any existing CommandPalette import that landed before 'use client'
src = src.replace(/import \{ CommandPalette \} from '@\/components\/command-palette'\n/, '')

// Ensure 'use client' is first, then inject import after it
if (!src.startsWith("'use client'")) {
  src = src.replace(/'use client'/, '')
  src = `'use client'\n` + src.trimStart()
}

// Inject import right after 'use client' line
src = src.replace(
  `'use client'\n`,
  `'use client'\nimport { CommandPalette } from '@/components/command-palette'\n`
)

writeFileSync(path, src, 'utf8')
console.log('✅ Fixed layout.tsx — use client is now first')
