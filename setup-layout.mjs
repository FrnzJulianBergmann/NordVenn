import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
  'app/globals.css': `@import "tailwindcss";

:root {
  --bg-base: #0a0a0f;
  --bg-surface: #111118;
  --bg-elevated: #1a1a24;
  --bg-hover: #22222e;
  --border: #2a2a38;
  --border-subtle: #1e1e2a;
  --text-primary: #e8e8f0;
  --text-secondary: #8888a8;
  --text-muted: #55556a;
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-base); color: var(--text-primary); font-family: sans-serif; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`,

  'app/layout.tsx': `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VendorPilot',
  description: 'Vendor management platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,

  'components/sidebar.tsx': `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Overview', href: '/', icon: '▦' },
  { label: 'Vendors', href: '/vendors', icon: '◈' },
  { label: 'Documents', href: '/documents', icon: '◻' },
  { label: 'Activity Log', href: '/activity', icon: '≡' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{
      width: 200, minHeight: '100vh', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)', display: 'flex',
      flexDirection: 'column', padding: '16px 0', position: 'fixed', top: 0, left: 0, zIndex: 50
    }}>
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>VendorPilot</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Workspace</div>
      </div>
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {nav.map(({ label, href, icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 6, marginBottom: 2, textDecoration: 'none', fontSize: 13,
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-elevated)' : 'transparent',
              fontWeight: active ? 500 : 400,
            }}>
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
        Admin
      </div>
    </aside>
  )
}
`,

  'components/topbar.tsx': `export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ padding: '20px 28px 0', marginBottom: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}
`,

  'app/(dashboard)/layout.tsx': `import Sidebar from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 200, flex: 1, minHeight: '100vh', background: 'var(--bg-base)' }}>
        {children}
      </main>
    </div>
  )
}
`,

  'app/(dashboard)/page.tsx': `import Topbar from '@/components/topbar'

export default function OverviewPage() {
  return (
    <>
      <Topbar title="Overview" subtitle="Real-time overview of vendor onboarding and compliance." />
      <div style={{ padding: '0 28px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Dashboard coming in next step.</p>
      </div>
    </>
  )
}
`,
}

for (const [filePath, content] of Object.entries(files)) {
  const full = join(base, filePath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, 'utf8')
  console.log('✓', filePath)
}

console.log('\n✅ Layout selesai. Cek browser di localhost:3000')
