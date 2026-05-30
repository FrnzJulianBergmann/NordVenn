import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), 'utf8')

// 1. Replace SOC 2 Ready with factual copy
src = src.replace(
  `  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',                              label: 'SOC 2 Ready' },`,
  `  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',                              label: 'Audit-ready exports' },`
)

// 2. Add confirmDowngrade state
src = src.replace(
  `  const [loading, setLoading] = useState(false)`,
  `  const [loading, setLoading] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState(false)`
)

// 3. Gate Switch to Free button — show confirm first
src = src.replace(
  `                onClick={() => isPro ? activate('free') : undefined}
                disabled={!isPro || loading}`,
  `                onClick={() => isPro ? setConfirmDowngrade(true) : undefined}
                disabled={!isPro || loading}`
)

// 4. Add confirm downgrade modal before closing </> 
src = src.replace(
  `    </>
  )
}`,
  `      {/* Confirm Downgrade Modal */}
      {confirmDowngrade && (
        <>
          <div onClick={() => setConfirmDowngrade(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 500 }}/>
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 380, zIndex: 501,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e8970a18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8970a" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Downgrade to Free?</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
              You'll lose access to:
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
              {['Audit export', 'Email reminders', 'Unlimited vendors', 'Unlimited workspaces', 'Compliance analytics'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 4 ? 6 : 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8403a" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDowngrade(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px #4C6FFF40' }}>
                Keep Pro
              </button>
              <button onClick={() => { setConfirmDowngrade(false); activate('free') }} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                {loading ? 'Switching...' : 'Switch to Free'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}`
)

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), src, 'utf8')
console.log('✅ Fixed!')
console.log('   · SOC 2 Ready → Audit-ready exports')
console.log('   · Switch to Free → confirm modal with features lost list')
