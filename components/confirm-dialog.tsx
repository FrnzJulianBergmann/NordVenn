'use client'
import { createContext, useContext, useState, useCallback } from 'react'

type ConfirmOptions = { title?: string; message: string; confirmLabel?: string; danger?: boolean }
type ConfirmCtx = { confirm: (opts: ConfirmOptions) => Promise<boolean> }

const Ctx = createContext<ConfirmCtx>({ confirm: async () => false })
export const useConfirm = () => useContext(Ctx)

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>(resolve => setState({ opts, resolve }))
  }, [])

  const handle = (v: boolean) => { state?.resolve(v); setState(null) }

  return (
    <Ctx.Provider value={{ confirm }}>
      {children}
      {state && (
        <>
          <div onClick={() => handle(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 500 }}/>
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 360, zIndex: 501,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'cfmIn 0.15s ease',
          }}>
            <style>{`@keyframes cfmIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>

            {/* Icon */}
            <div style={{ width: 40, height: 40, borderRadius: 10, background: state.opts.danger ? '#e8403a18' : '#4C6FFF18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {state.opts.danger
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8403a" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              }
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {state.opts.title || (state.opts.danger ? 'Confirm Delete' : 'Are you sure?')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              {state.opts.message}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handle(false)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}>Cancel</button>
              <button onClick={() => handle(true)} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: state.opts.danger ? '#e8403a' : 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',
                color: '#fff',
                boxShadow: state.opts.danger ? '0 4px 12px #e8403a40' : '0 4px 12px #4C6FFF40',
              }}>{state.opts.confirmLabel || (state.opts.danger ? 'Delete' : 'Confirm')}</button>
            </div>
          </div>
        </>
      )}
    </Ctx.Provider>
  )
}
