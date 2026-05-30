import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'NordVenn <onboarding@resend.dev>'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function emailHTML(items: any[], type: 'critical' | 'warning') {
  const color = type === 'critical' ? '#e8403a' : '#e8970a'
  const label = type === 'critical' ? 'CRITICAL — Immediate Action Required' : 'WARNING — Documents Expiring Soon'
  const rows = items.map(d => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #1a2130;color:#c0c0d0;font-size:13px">${d.doc_name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1a2130;color:#c0c0d0;font-size:13px">${d.vendor_name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1a2130;font-size:13px">
        <span style="color:${color};font-weight:700">${d.days < 0 ? 'EXPIRED' : 'In ' + d.days + ' days'}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #1a2130;color:#7a8599;font-size:12px">${d.expiry_date}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="background:#0B0E14;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:580px;margin:0 auto">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
      <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#4C6FFF,#7AA2FF);display:flex;align-items:center;justify-content:center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 20V4l8 12V4" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 4v16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>
      <span style="font-size:16px;font-weight:700;color:#E6E8EC;letter-spacing:-0.3px">NordVenn</span>
    </div>

    <!-- Alert badge -->
    <div style="background:${color}18;border:1px solid ${color}40;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;gap:10px">
      <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
      <span style="font-size:12px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em">${label}</span>
    </div>

    <!-- Body -->
    <div style="background:#11161D;border:1px solid #1a2130;border-radius:10px;overflow:hidden;margin-bottom:24px">
      <div style="padding:16px 18px;border-bottom:1px solid #1a2130">
        <div style="font-size:14px;font-weight:600;color:#E6E8EC">Document Compliance Alert</div>
        <div style="font-size:12px;color:#7a8599;margin-top:3px">${items.length} document${items.length > 1 ? 's' : ''} require${items.length === 1 ? 's' : ''} your attention</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid #1a2130">
            <th style="padding:8px 14px;text-align:left;color:#455065;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Document</th>
            <th style="padding:8px 14px;text-align:left;color:#455065;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Vendor</th>
            <th style="padding:8px 14px;text-align:left;color:#455065;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Status</th>
            <th style="padding:8px 14px;text-align:left;color:#455065;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Expiry</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px">
      <a href="https://nordvenn.vercel.app/documents" style="display:inline-block;background:linear-gradient(135deg,#4C6FFF,#7AA2FF);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:-0.2px">
        View in NordVenn →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:11px;color:#455065;border-top:1px solid #1a2130;padding-top:20px">
      NordVenn · Vendor Compliance Platform<br/>
      <span style="opacity:0.6">You're receiving this because document alerts are enabled in your workspace.</span>
    </div>
  </div>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.json()
}

serve(async (req) => {
  try {
    const now = new Date()
    const in7  = new Date(); in7.setDate(now.getDate() + 7)
    const in30 = new Date(); in30.setDate(now.getDate() + 30)

    // Fetch all docs with vendor info
    const { data: docs } = await supabase
      .from('documents')
      .select('*, vendors(name)')
      .not('expiry_date', 'is', null)

    if (!docs?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 })

    // Fetch user emails
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const emails = users.map((u: any) => u.email).filter(Boolean)

    if (!emails.length) return new Response(JSON.stringify({ error: 'No users' }), { status: 200 })

    const expired: any[] = []
    const expiring7: any[] = []
    const expiring30: any[] = []

    docs.forEach(d => {
      const exp = new Date(d.expiry_date)
      const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000)
      const item = {
        doc_name: d.name || d.type,
        vendor_name: (d.vendors as any)?.name || '—',
        days,
        expiry_date: exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }
      if (exp < now) expired.push(item)
      else if (exp <= in7) expiring7.push(item)
      else if (exp <= in30) expiring30.push(item)
    })

    const results = []

    // Critical — expired + expiring in 7 days
    const critical = [...expired, ...expiring7]
    if (critical.length) {
      for (const email of emails) {
        const r = await sendEmail(
          email,
          `🔴 [NordVenn] ${critical.length} document${critical.length > 1 ? 's' : ''} need immediate attention`,
          emailHTML(critical, 'critical')
        )
        results.push({ type: 'critical', email, result: r })
      }
    }

    // Warning — expiring in 8-30 days
    if (expiring30.length) {
      for (const email of emails) {
        const r = await sendEmail(
          email,
          `🟠 [NordVenn] ${expiring30.length} document${expiring30.length > 1 ? 's' : ''} expiring within 30 days`,
          emailHTML(expiring30, 'warning')
        )
        results.push({ type: 'warning', email, result: r })
      }
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
