import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const TARGET = resolve('app/(dashboard)/vendors/page.tsx')
let src = readFileSync(TARGET, 'utf8')

// 1. Add COUNTRIES data + PhoneInput component after imports
const injection = `
const COUNTRIES = [
  {code:'US',dial:'+1',flag:'🇺🇸'},{code:'GB',dial:'+44',flag:'🇬🇧'},
  {code:'ID',dial:'+62',flag:'🇮🇩'},{code:'SG',dial:'+65',flag:'🇸🇬'},
  {code:'AU',dial:'+61',flag:'🇦🇺'},{code:'CA',dial:'+1',flag:'🇨🇦'},
  {code:'DE',dial:'+49',flag:'🇩🇪'},{code:'FR',dial:'+33',flag:'🇫🇷'},
  {code:'JP',dial:'+81',flag:'🇯🇵'},{code:'IN',dial:'+91',flag:'🇮🇳'},
  {code:'BR',dial:'+55',flag:'🇧🇷'},{code:'MX',dial:'+52',flag:'🇲🇽'},
  {code:'AE',dial:'+971',flag:'🇦🇪'},{code:'SA',dial:'+966',flag:'🇸🇦'},
  {code:'MY',dial:'+60',flag:'🇲🇾'},{code:'PH',dial:'+63',flag:'🇵🇭'},
  {code:'NL',dial:'+31',flag:'🇳🇱'},{code:'IT',dial:'+39',flag:'🇮🇹'},
  {code:'ES',dial:'+34',flag:'🇪🇸'},{code:'KR',dial:'+82',flag:'🇰🇷'},
]

const PhoneInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const parse = (v: string) => {
    const found = COUNTRIES.find(c => v.startsWith(c.dial + ' '))
    if (found) return { dial: found.dial, num: v.slice(found.dial.length + 1), country: found }
    return { dial: '+1', num: v.replace(/^\\+1 ?/, ''), country: COUNTRIES[0] }
  }
  const { dial, num, country } = parse(value)
  const [open, setOpen] = React.useState(false)
  const [sel, setSel] = React.useState(country)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectCountry = (c: typeof COUNTRIES[0]) => { setSel(c); setOpen(false); onChange(c.dial + ' ' + num) }
  const handleNum = (e: React.ChangeEvent<HTMLInputElement>) => onChange(sel.dial + ' ' + e.target.value)

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', gap: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRight: 'none', borderRadius: '6px 0 0 6px',
        padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13,
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{sel.flag}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sel.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <input
        type="tel" value={num} onChange={handleNum}
        placeholder="(555) 123-4567"
        style={{
          flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '0 6px 6px 0', padding: '8px 10px',
          color: 'var(--text-primary)', fontSize: 13, outline: 'none', minWidth: 0,
        }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          maxHeight: 220, overflowY: 'auto', minWidth: 200,
        }}>
          {COUNTRIES.map(c => (
            <button key={c.code} type="button" onClick={() => selectCountry(c)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 12px', background: sel.code === c.code ? 'var(--bg-elevated)' : 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ color: 'var(--text-muted)', width: 36, flexShrink: 0 }}>{c.dial}</span>
              <span>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
`

// 2. Add React import (needed for useState/useRef inside PhoneInput)
src = src.replace(
  `import { useEffect, useState } from 'react'`,
  `import React, { useEffect, useState } from 'react'`
)

// 3. Inject after imports block (before const DOC_TYPES)
src = src.replace(
  `const DOC_TYPES`,
  injection + `const DOC_TYPES`
)

// 4. Replace the plain phone inp() call with PhoneInput component
src = src.replace(
  `{inp('Phone','phone')}`,
  `<div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-muted)',marginBottom:5,textTransform:'uppercase',letterSpacing:'0.07em'}}>Phone</label>
              <PhoneInput value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))}/>
            </div>`
)

writeFileSync(TARGET, src, 'utf8')
console.log('✅ Phone country code selector added!')
