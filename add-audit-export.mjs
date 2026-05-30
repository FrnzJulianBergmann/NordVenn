import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. components/audit-export.tsx ──────────────────────────────────────────
const component = `'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

function computeScore(vendor: any, docs: any[]) {
  const now = new Date()
  const in30 = new Date(); in30.setDate(now.getDate() + 30)
  let deductions = 0; const reasons: string[] = []
  const vDocs = docs.filter(d => d.vendor_id === vendor.id)
  const expired = vDocs.filter(d => d.expiry_date && new Date(d.expiry_date) < now)
  const expiring = vDocs.filter(d => d.expiry_date && new Date(d.expiry_date) <= in30 && new Date(d.expiry_date) >= now)
  if (expired.length) { const d = Math.min(expired.length * 20, 40); deductions += d; reasons.push(expired.length + ' expired doc(s)') }
  if (expiring.length) { const d = Math.min(expiring.length * 10, 20); deductions += d; reasons.push(expiring.length + ' expiring soon') }
  if (vendor.status === 'pending') { deductions += 10; reasons.push('Pending review') }
  const uploaded = vDocs.map((d: any) => d.type)
  const missing = (vendor.required_docs || []).filter((r: string) => !uploaded.includes(r))
  if (missing.length) { const d = Math.min(missing.length * 5, 15); deductions += d; reasons.push(missing.length + ' missing doc(s)') }
  const score = Math.max(0, 100 - deductions)
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  const risk = score >= 75 ? 'Low' : score >= 50 ? 'Warning' : 'Critical'
  const riskColor = score >= 75 ? '#0ea871' : score >= 50 ? '#e8970a' : '#e8403a'
  return { score, grade, risk, riskColor, reasons, missing, expired, expiring }
}

function genAuditId() {
  const d = new Date()
  const ymd = d.getFullYear() + ('0'+(d.getMonth()+1)).slice(-2) + ('0'+d.getDate()).slice(-2)
  return 'NV-' + ymd + '-' + Math.floor(Math.random()*900+100)
}

function buildHTML(vendor: any, docs: any[], logs: any[], auditId: string) {
  const now = new Date()
  const sc = computeScore(vendor, docs)
  const vDocs = docs.filter(d => d.vendor_id === vendor.id)
  const vLogs = logs.filter(l => l.description === vendor.name).slice(0, 8)

  const docRows = vDocs.map(d => {
    const exp = d.expiry_date ? new Date(d.expiry_date) : null
    const isExp = exp && exp < now
    const isWarn = exp && !isExp && exp <= new Date(now.getTime() + 30*86400000)
    const statusColor = isExp ? '#e8403a' : isWarn ? '#e8970a' : '#0ea871'
    const statusLabel = isExp ? 'EXPIRED' : isWarn ? 'EXPIRING' : 'OK'
    return \`<tr>
      <td>\${d.name || d.type}</td>
      <td>\${d.type}</td>
      <td>\${exp ? exp.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}</td>
      <td><span style="color:\${statusColor};font-weight:700;font-size:11px">\${statusLabel}</span></td>
    </tr>\`
  }).join('')

  const missingRows = sc.missing.map((m: string) => \`<tr>
    <td>\${m}</td><td>—</td><td>—</td>
    <td><span style="color:#e8403a;font-weight:700;font-size:11px">MISSING</span></td>
  </tr>\`).join('')

  const logRows = vLogs.map(l => \`<tr>
    <td>\${new Date(l.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
    <td>\${new Date(l.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</td>
    <td>\${l.action}</td>
  </tr>\`).join('')

  return \`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Audit Report — \${vendor.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0d0d14; color:#e2e2f0; padding:48px; font-size:13px; line-height:1.6 }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:1px solid #2a2a3a }
  .brand { font-size:22px; font-weight:800; color:#5b5ef4; letter-spacing:-0.5px }
  .brand-sub { font-size:11px; color:#666; margin-top:3px }
  .audit-id { text-align:right }
  .audit-id .label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:0.08em }
  .audit-id .value { font-size:13px; color:#888; font-family:monospace; margin-top:3px }
  .audit-id .date { font-size:11px; color:#555; margin-top:2px }
  h2 { font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#5b5ef4; margin-bottom:14px; font-weight:700 }
  .section { margin-bottom:36px }
  .card { background:#13131e; border:1px solid #2a2a3a; border-radius:8px; padding:20px }
  .score-row { display:flex; align-items:center; gap:20px }
  .score-circle { width:72px; height:72px; border-radius:50%; border:4px solid \${sc.riskColor}; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0 }
  .score-num { font-size:22px; font-weight:800; color:\${sc.riskColor} }
  .score-sub { font-size:9px; color:#666 }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
  .info-item .label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:4px }
  .info-item .value { font-size:13px; color:#e2e2f0; font-weight:500 }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; text-transform:uppercase }
  .badge-active { color:#0ea871; background:#0ea87118 }
  .badge-pending { color:#e8970a; background:#e8970a18 }
  .badge-inactive { color:#44445a; background:#44445a18 }
  table { width:100%; border-collapse:collapse; font-size:12px }
  th { padding:8px 12px; text-align:left; color:#666; font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.07em; border-bottom:1px solid #2a2a3a }
  td { padding:9px 12px; border-bottom:1px solid #1a1a28; color:#c0c0d0 }
  tr:last-child td { border-bottom:none }
  .risk-row { display:flex; align-items:center; gap:10px; margin-bottom:10px }
  .risk-badge { padding:3px 10px; border-radius:4px; font-size:11px; font-weight:700; background:\${sc.riskColor}18; color:\${sc.riskColor} }
  .reason-item { font-size:12px; color:#888; padding:3px 0; display:flex; gap:8px }
  .dot { width:5px; height:5px; border-radius:50%; background:\${sc.riskColor}; margin-top:6px; flex-shrink:0 }
  .footer { margin-top:48px; padding-top:20px; border-top:1px solid #2a2a3a; display:flex; justify-content:space-between; font-size:10px; color:#444 }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">NordVen</div>
    <div class="brand-sub">Vendor Compliance Platform</div>
  </div>
  <div class="audit-id">
    <div class="label">Audit Reference</div>
    <div class="value">\${auditId}</div>
    <div class="date">Generated \${now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
  </div>
</div>

<div class="section">
  <h2>Vendor Information</h2>
  <div class="card">
    <div class="info-grid">
      <div class="info-item"><div class="label">Vendor Name</div><div class="value">\${vendor.name}</div></div>
      <div class="info-item"><div class="label">Category</div><div class="value">\${vendor.category || '—'}</div></div>
      <div class="info-item"><div class="label">Email</div><div class="value">\${vendor.email || '—'}</div></div>
      <div class="info-item"><div class="label">Phone</div><div class="value">\${vendor.phone || '—'}</div></div>
      <div class="info-item"><div class="label">Status</div><div class="value"><span class="badge badge-\${vendor.status}">\${vendor.status}</span></div></div>
      <div class="info-item"><div class="label">Added</div><div class="value">\${new Date(vendor.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div>
    </div>
  </div>
</div>

<div class="section">
  <h2>Compliance Health Score</h2>
  <div class="card">
    <div class="score-row">
      <div class="score-circle">
        <div class="score-num">\${sc.score}</div>
        <div class="score-sub">/ 100</div>
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;color:#e2e2f0;margin-bottom:6px">Grade \${sc.grade}</div>
        <div style="font-size:12px;color:\${sc.riskColor};font-weight:600;margin-bottom:8px">Risk Level: \${sc.risk}</div>
        \${sc.reasons.length === 0
          ? '<div style="font-size:12px;color:#0ea871">✓ All documents compliant</div>'
          : sc.reasons.map((r: string) => \`<div class="reason-item"><div class="dot"></div>\${r}</div>\`).join('')
        }
      </div>
    </div>
  </div>
</div>

<div class="section">
  <h2>Required Documents</h2>
  <div class="card" style="padding:0">
    <table>
      <thead><tr><th>Document</th><th>Type</th><th>Expiry Date</th><th>Status</th></tr></thead>
      <tbody>
        \${docRows || '<tr><td colspan="4" style="text-align:center;color:#555;padding:20px">No documents uploaded</td></tr>'}
        \${missingRows}
      </tbody>
    </table>
  </div>
</div>

<div class="section">
  <h2>Activity Timeline</h2>
  <div class="card" style="padding:0">
    <table>
      <thead><tr><th>Date</th><th>Time</th><th>Action</th></tr></thead>
      <tbody>
        \${logRows || '<tr><td colspan="3" style="text-align:center;color:#555;padding:20px">No activity recorded</td></tr>'}
      </tbody>
    </table>
  </div>
</div>

<div class="footer">
  <div>NordVen · Vendor Compliance Platform</div>
  <div>Audit Ref: \${auditId} · \${now.toISOString()}</div>
</div>
</body></html>\`
}

export function AuditExportButton({ vendor }: { vendor: any }) {
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const [docsRes, logsRes] = await Promise.all([
      supabase.from('documents').select('*'),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }),
    ])
    const auditId = genAuditId()
    const html = buildHTML(vendor, docsRes.data || [], logsRes.data || [], auditId)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`NordVen-Audit-\${vendor.name.replace(/\\s+/g,'-')}-\${auditId}.html\`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <button onClick={generate} disabled={loading} style={{
      background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)',
      borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11,
      display: 'inline-flex', alignItems: 'center', gap: 5, opacity: loading ? 0.6 : 1,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {loading ? 'Generating...' : 'Export Audit'}
    </button>
  )
}
`

// ── 2. Patch vendors/page.tsx — add import + Export button in Actions column ──
const vendorPath = resolve('app/(dashboard)/vendors/page.tsx')
let src = readFileSync(vendorPath, 'utf8')

// Add import
src = src.replace(
  `import Topbar from '@/components/topbar'`,
  `import Topbar from '@/components/topbar'\nimport { AuditExportButton } from '@/components/audit-export'`
)

// Add Export Audit button next to Edit/Delete
src = src.replace(
  `<button onClick={()=>del(v.id,v.name)} style={{background:'none',border:'1px solid #e8403a33',color:'var(--danger)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11}}>Delete</button>`,
  `<button onClick={()=>del(v.id,v.name)} style={{background:'none',border:'1px solid #e8403a33',color:'var(--danger)',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11,marginRight:6}}>Delete</button>
                      <AuditExportButton vendor={v} />`
)

writeFileSync(vendorPath, src, 'utf8')
writeFileSync(resolve('components/audit-export.tsx'), component, 'utf8')
console.log('✅ Audit Export added! Button appears in Vendors table Actions column.')
