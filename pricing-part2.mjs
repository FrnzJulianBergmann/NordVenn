import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), 'utf8')

// 1. Make grid asymmetric — Pro card bigger
src = src.replace(
  `display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16`,
  `display: 'grid', gridTemplateColumns: '1fr 1.08fr', gap: 16, alignItems: 'start'`
)

// 2. Upgrade Free card style — more muted, less prominent
src = src.replace(
  `          {/* Free */}
          <div style={{
            background: 'var(--bg-surface)', border: \`1px solid \${!isPro ? '#4C6FFF60' : 'var(--border-subtle)'}\`,
            borderRadius: 12, overflow: 'hidden',
            boxShadow: !isPro ? '0 0 0 1px #4C6FFF20' : 'none',
          }}>`,
  `          {/* Free */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12, overflow: 'hidden',
            opacity: isPro ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}>`
)

// 3. Upgrade Pro card — glow, elevated, bigger shadow
src = src.replace(
  `          {/* Pro */}
          <div style={{
            background: 'linear-gradient(180deg,#13182e 0%,#0f1220 100%)',
            border: \`1px solid \${isPro ? '#4C6FFF60' : '#4C6FFF30'}\`,
            borderRadius: 12, overflow: 'hidden', position: 'relative',
            boxShadow: isPro ? '0 0 0 1px #4C6FFF20, 0 8px 32px #4C6FFF18' : '0 4px 16px #4C6FFF10',
          }}>`,
  `          {/* Pro */}
          <div style={{
            background: 'linear-gradient(180deg,#13182e 0%,#0f1220 100%)',
            border: '1px solid #4C6FFF50',
            borderRadius: 12, overflow: 'hidden', position: 'relative',
            boxShadow: isPro
              ? '0 0 0 1px #4C6FFF30, 0 16px 48px #4C6FFF25, 0 4px 16px rgba(0,0,0,0.4)'
              : '0 0 0 1px #4C6FFF20, 0 12px 40px #4C6FFF20, 0 4px 16px rgba(0,0,0,0.3)',
            transform: 'translateY(-4px)',
          }}>`
)

// 4. Upgrade RECOMMENDED badge — more premium
src = src.replace(
  `            {/* Popular badge */}
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
              RECOMMENDED
            </div>`,
  `            {/* Popular badge */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '4px 12px', borderRadius: 20, letterSpacing: '0.06em',
              boxShadow: '0 2px 12px #4C6FFF60',
            }}>
              ✦ RECOMMENDED
            </div>`
)

// 5. Make Pro price bigger
src = src.replace(
  `              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#E6E8EC', letterSpacing: '-1px' }}>$19</span>
                <span style={{ fontSize: 13, color: '#7a8599' }}>/month</span>
              </div>`,
  `              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#E6E8EC', letterSpacing: '-2px' }}>$19</span>
                <span style={{ fontSize: 13, color: '#7a8599' }}>/month</span>
              </div>`
)

// 6. Upgrade Pro CTA button glow
src = src.replace(
  `                  boxShadow: isPro ? 'none' : '0 4px 16px #4C6FFF50',`,
  `                  boxShadow: isPro ? 'none' : '0 4px 20px #4C6FFF60, 0 2px 8px #4C6FFF40',`
)

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), src, 'utf8')
console.log('✅ Part 2 done!')
console.log('   · Pro card: elevated, glow, bigger, translateY(-4px)')
console.log('   · Free card: muted when Pro active')
console.log('   · Pro price: 42px bold')
console.log('   · RECOMMENDED badge: glow + star icon')
