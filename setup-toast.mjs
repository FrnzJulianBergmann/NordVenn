import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'components/toast.tsx': `'use client'
import { useEffect, useState } from 'react'

type Toast = { id: number; msg: string; type: 'success' | 'error' | 'info' }
type Listener = (t: Toast) => void

const listeners: Listener[] = []

export const toast = {
  success: (msg: string) => emit({ id: Date.now(), msg, type: 'success' }),
  error: (msg: string) => emit({ id: Date.now(), msg, type: 'error' }),
  info: (msg: string) => emit({ id: Date.now(), msg, type: 'info' }),
}

function emit(t: Toast) { listeners.forEach(l => l(t)) }

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts(p => [...p, t])
      setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3000)
    }
    listeners.push(handler)
    return () => { listeners.splice(listeners.indexOf(handler), 1) }
  }, [])

  const colors: any = {
    success: { bg: '#0ea87118', border: '#0ea87144', dot: '#0ea871' },
    error: { bg: '#e8403a18', border: '#e8403a44', dot: '#e8403a' },
    info: { bg: '#5b5ef418', border: '#5b5ef444', dot: '#5b5ef4' },
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => {
        const c = colors[t.type]
        return (
          <div key={t.id} style={{
            background: 'var(--bg-surface)', border: '1px solid ' + c.border,
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: 10, minWidth: 240, maxWidth: 320,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {t.msg}
          </div>
        )
      })}
      <style>{
        \`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }\`
      }</style>
    </div>
  )
}
`,

'app/(dashboard)/layout.tsx': `'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/sidebar'
import Toaster from '@/components/toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
    })
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)' }}>
        {children}
      </main>
      <Toaster />
    </div>
  )
}
`,

'app/globals.css': `@import "tailwindcss";

:root {
  --bg-base: #080810;
  --bg-surface: #0f0f1a;
  --bg-elevated: #161625;
  --bg-hover: #1e1e30;
  --border: #252538;
  --border-subtle: #18182a;
  --text-primary: #eeeef5;
  --text-secondary: #7878a0;
  --text-muted: #44445a;
  --accent: #5b5ef4;
  --accent-hover: #7476f8;
  --success: #0ea871;
  --warning: #e8970a;
  --danger: #e8403a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-base); color: var(--text-primary); font-family: 'Inter', -apple-system, sans-serif; font-size: 14px; line-height: 1.5; }
a { color: inherit; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

tr { transition: background 0.1s ease; }
tr:hover td { background: rgba(255,255,255,0.025) !important; }
button { transition: opacity 0.15s ease, transform 0.1s ease; }
button:hover { opacity: 0.85; }
button:active { transform: scale(0.97); }
a { transition: opacity 0.15s ease; }
`,
}

for (const [f,c] of Object.entries(files)) {
  const full = join(base,f)
  mkdirSync(dirname(full),{recursive:true})
  writeFileSync(full,c,'utf8')
  console.log('✓',f)
}
console.log('\n✅ Toast + hover done. Sekarang update vendors & documents page pakai toast.')
