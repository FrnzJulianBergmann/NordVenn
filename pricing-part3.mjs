import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), 'utf8')

// Add social trust + trust badges after the pricing grid closing div
src = src.replace(
  `      </div>\n    </>\n  )\n}`,
  `      </div>

        {/* Social trust */}
        <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Trusted by operations-focused startups & compliance teams
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'SOC 2 Ready' },
              { icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', label: 'Audit-grade exports' },
              { icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', label: 'Built for procurement' },
              { icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2', label: 'Real-time compliance' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 10,
          maxWidth: 500, margin: '0 auto',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>No credit card required</span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Cancel anytime</span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea871" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Data stays yours</span>
        </div>

      </div>
    </>
  )
}`
)

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), src, 'utf8')
console.log('✅ Part 3 done!')
console.log('   · Social trust row: 4 credibility points')
console.log('   · Trust badges: No credit card · Cancel anytime · Data stays yours')
