import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const exts = ['.tsx', '.ts', '.css', '.json', '.md']

function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (['node_modules','.next','.git'].includes(f)) continue
    const full = join(dir, f)
    if (statSync(full).isDirectory()) walk(full)
    else if (exts.some(e => f.endsWith(e))) {
      const before = readFileSync(full, 'utf8')
      const after = before.replaceAll('VendorPilot', 'NordVen').replaceAll('Vendorpilot', 'NordVen').replaceAll('vendorpilot', 'nordven')
      if (before !== after) { writeFileSync(full, after, 'utf8'); console.log('✓', full.replace(base,'')) }
    }
  }
}

walk(base)
console.log('\n✅ Renamed to NordVen. Refresh browser.')
