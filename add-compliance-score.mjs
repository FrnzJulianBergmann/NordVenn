import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const TARGET = resolve('app/(dashboard)/page.tsx')

let src = readFileSync(TARGET, 'utf8')

// 1. Inject computeComplianceScore function after the imports block
const scoreFunc = `
// ── Compliance Health Score ──────────────────────────────────────────────────
function computeComplianceScore(vendors: any[], docs: any[], expired: any[], expiring: any[]) {
  if (!vendors.length) return { score: 100, grade: 'A', color: '#0ea871', reasons: [] }

  let deductions = 0
  const reasons: string[] = []

  const expiredRatio = expired.length / Math.max(docs.length, 1)
  if (expiredRatio > 0) {
    const d = Math.round(expiredRatio * 40)
    deductions += d
    reasons.push(\`\${expired.length} expired doc\${expired.length > 1 ? 's' : ''} (-\${d})\`)
  }

  const expiringRatio = expiring.length / Math.max(docs.length, 1)
  if (expiringRatio > 0) {
    const d = Math.round(expiringRatio * 20)
    deductions += d
    reasons.push(\`\${expiring.length} expiring soon (-\${d})\`)
  }

  const pendingVendors = vendors.filter(v => v.status === 'pending')
  if (pendingVendors.length) {
    const d = Math.min(pendingVendors.length * 10, 25)
    deductions += d
    reasons.push(\`\${pendingVendors.length} pending review (-\${d})\`)
  }

  const missingDocs = vendors.filter(v => v.missing_docs && v.missing_docs.length > 0)
  if (missingDocs.length) {
    const d = Math.min(missingDocs.length * 5, 15)
    deductions += d
    reasons.push(\`\${missingDocs.length} vendor\${missingDocs.length > 1 ? 's' : ''} missing docs (-\${d})\`)
  }

  const score = Math.max(0, 100 - deductions)
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  const color = score >= 75 ? '#0ea871' : score >= 50 ? '#e8970a' : '#e8403a'
  return { score, grade, color, reasons }
}
`

// Insert after last import line
src = src.replace(
  /^((?:import[\s\S]*?\n)+)/m,
  (match) => match + scoreFunc
)

// 2. Inject ComplianceCard component before export default
const complianceCard = `
const ComplianceCard = ({ score, grade, color, reasons }: { score: number; grade: string; color: string; reasons: string[] }) => {
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference
  return (
    <div style={{
      background: 'var(--bg-surface)', border: \`1px solid \${color}40\`,
      borderRadius: 8, padding: 14, marginBottom: 16
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
        Compliance Health Score
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border-subtle)" strokeWidth="6"/>
            <circle cx="36" cy="36" r="28" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{
              background: color + '20', color, fontSize: 11, fontWeight: 700,
              borderRadius: 4, padding: '1px 7px'
            }}>Grade {grade}</span>
          </div>
          {reasons.length === 0
            ? <div style={{ fontSize: 11, color: '#0ea871' }}>✓ All vendors compliant</div>
            : reasons.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 5, marginBottom: 2 }}>
                  <span style={{ color: 'var(--danger)', flexShrink: 0 }}>↓</span>{r}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}

`

src = src.replace(
  /export default function OverviewPage/,
  complianceCard + 'export default function OverviewPage'
)

// 3. Inject score computation inside the component, after the expiring/expired lines
src = src.replace(
  /const daysUntil = /,
  `const { score: cScore, grade: cGrade, color: cColor, reasons: cReasons } = computeComplianceScore(vendors, docs, expired, expiring)\n\n  const daysUntil = `
)

// 4. Inject <ComplianceCard> inside the Right Panel, before Alerts div
src = src.replace(
  /\/\* Right Panel \*\//,
  `{/* Right Panel */}`
)

src = src.replace(
  /<div style=\{\{\.\.\.card,padding:14\}\}>\s*\n\s*<div style=\{\{fontSize:11,fontWeight:600,color:'var\(--text-primary\)',marginBottom:12,display:'flex'/,
  `<ComplianceCard score={cScore} grade={cGrade} color={cColor} reasons={cReasons} />\n          <div style={{...card,padding:14}}>\n            <div style={{fontSize:11,fontWeight:600,color:'var(--text-primary)',marginBottom:12,display:'flex'`
)

writeFileSync(TARGET, src, 'utf8')
console.log('✅ Compliance Health Score added to Overview page!')
