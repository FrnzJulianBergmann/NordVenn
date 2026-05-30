import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), 'utf8')

// 1. Fix Free plan description
src = src.replace(
  `Get started with vendor compliance basics.`,
  `Perfect for small teams getting started with vendor management.`
)

// 2. Fix Pro plan description
src = src.replace(
  `Everything you need for serious vendor compliance.`,
  `Built for teams managing vendor risk at scale.`
)

// 3. Remove "No credit card required during beta · Cancel anytime" bottom note
src = src.replace(
  `        {/* Bottom note */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          No credit card required during beta · Cancel anytime
        </div>`,
  ``
)

// 4. Remove Downgrade to Free button from current plan banner
src = src.replace(
  `          {isPro && (
            <button onClick={() => activate('free')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
              Downgrade to Free
            </button>
          )}`,
  ``
)

// 5. Fix Free plan button — remove downgrade option, make it "Switch to Free" only
src = src.replace(
  `              <button
                onClick={() => !isPro ? null : activate('free')}
                disabled={!isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPro ? 'pointer' : 'default',
                  background: !isPro ? 'var(--bg-elevated)' : 'none',
                  border: \`1px solid \${!isPro ? 'var(--accent)' : 'var(--border)'}\`,
                  color: !isPro ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {!isPro ? '✓ Current plan' : 'Downgrade'}
              </button>`,
  `              <button
                onClick={() => isPro ? activate('free') : null}
                disabled={!isPro || loading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 500, 
                  cursor: isPro ? 'pointer' : 'default',
                  background: 'none',
                  border: '1px solid var(--border)',
                  color: !isPro ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {!isPro ? '✓ Current plan' : 'Switch to Free'}
              </button>`
)

// 6. Fix Free plan section label
src = src.replace(
  `              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Includes</div>`,
  `              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>What you get</div>`
)

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), src, 'utf8')
console.log('✅ Part 1 done!')
console.log('   · Free: better copy + "Switch to Free" button')
console.log('   · Pro: enterprise copywriting')
console.log('   · Removed: downgrade button, bottom note')
