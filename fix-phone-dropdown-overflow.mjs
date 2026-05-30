import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/settings/page.tsx'), 'utf8')

// Fix Section component - remove overflow hidden
src = src.replace(
  `borderRadius: 8, marginBottom: 16, overflow: 'hidden'`,
  `borderRadius: 8, marginBottom: 16`
)

// Fix PhoneInput dropdown to use position fixed so it escapes any container
src = src.replace(
  `position: 'absolute', top: '100%', left: 0, zIndex: 300, marginTop: 4,`,
  `position: 'fixed', zIndex: 9999, marginTop: 4,`
)

// Need to calculate position dynamically - replace the dropdown div with a ref-based approach
src = src.replace(
  `const ref = React.useRef<HTMLDivElement>(null)`,
  `const ref = React.useRef<HTMLDivElement>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 })`
)

src = src.replace(
  `onClick={() => setOpen(o => !o)} style={{`,
  `ref={btnRef} onClick={() => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect()
          setDropPos({ top: r.bottom + 4, left: r.left, width: r.width + 200 })
        }
        setOpen(o => !o)
      }} style={{`
)

src = src.replace(
  `position: 'fixed', zIndex: 9999, marginTop: 4,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight: 220, overflowY: 'auto', minWidth: 210,`,
  `position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight: 220, overflowY: 'auto', minWidth: 210,`
)

writeFileSync(resolve('app/(dashboard)/settings/page.tsx'), src, 'utf8')
console.log('✅ Phone dropdown overflow fixed!')
