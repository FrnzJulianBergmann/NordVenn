'use client'
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
        `@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`
      }</style>
    </div>
  )
}
