import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/settings/page.tsx'), 'utf8')

// 1. Add React import + COUNTRIES + PhoneInput component after imports
const phoneComponent = `
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
    if (found) return { num: v.slice(found.dial.length + 1), country: found }
    return { num: v.replace(/^\\+\\d+ ?/, ''), country: COUNTRIES[0] }
  }
  const { num, country } = parse(value)
  const [open, setOpen] = React.useState(false)
  const [sel, setSel] = React.useState(country)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const selectCountry = (c: typeof COUNTRIES[0]) => { setSel(c); setOpen(false); onChange(c.dial + ' ' + num) }
  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRight: 'none', borderRadius: '6px 0 0 6px',
        padding: '8px 10px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13,
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>{sel.flag}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 30 }}>{sel.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <input type="tel" value={num} onChange={e => onChange(sel.dial + ' ' + e.target.value)}
        placeholder="812 3456 7890"
        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 0', padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', minWidth: 0 }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 300, marginTop: 4,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          maxHeight: 220, overflowY: 'auto', minWidth: 210,
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

// 2. Inject after imports
src = src.replace(
  `const Section = `,
  phoneComponent + `const Section = `
)

// 3. Replace plain phone input with PhoneInput component
src = src.replace(
  `            <Field label="Phone">
              <input style={inp} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 123-4567" />
            </Field>`,
  `            <Field label="Phone">
              <PhoneInput value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
            </Field>`
)

// 4. Hardcode role to Admin in business card — fix sidebar
writeFileSync(resolve('app/(dashboard)/settings/page.tsx'), src, 'utf8')
console.log('✅ Settings phone upgraded to country code selector!')
