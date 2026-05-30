import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve('components/topbar.tsx')
let src = readFileSync(path, 'utf8')

src = src.replace(
  `<div style={{ position: 'relative' }}>
        <div onClick={logout} title="Sign out" style={{
          width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'
        }}>A</div>
      </div>`,
  `<button onClick={logout} title="Sign out" style={{
        width: 32, height: 32, borderRadius: 8, background: 'none',
        border: '1px solid transparent', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>`
)

writeFileSync(path, src, 'utf8')
console.log('✅ Topbar logout icon updated')
