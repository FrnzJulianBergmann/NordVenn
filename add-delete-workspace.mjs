import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

// 1. Add useConfirm import
src = src.replace(
  `import { usePathname } from 'next/navigation'`,
  `import { usePathname } from 'next/navigation'
import { useConfirm } from '@/components/confirm-dialog'`
)

// 2. Add confirm hook inside component
src = src.replace(
  `  const wsRef = useRef<HTMLDivElement>(null)`,
  `  const { confirm } = useConfirm()
  const wsRef = useRef<HTMLDivElement>(null)`
)

// 3. Add deleteWorkspace function after createWorkspace
src = src.replace(
  `  const accentColor = '#4C6FFF'`,
  `  const deleteWorkspace = async (ws: typeof all[0], e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Workspace',
      message: \`Are you sure you want to delete "\${ws.name}"? All vendors and documents in this workspace will be permanently deleted.\`,
      danger: true,
      confirmLabel: 'Delete Workspace',
    })
    if (!ok) return
    await supabase.from('vendors').delete().eq('workspace_id', ws.id)
    await supabase.from('documents').delete().eq('workspace_id', ws.id)
    await supabase.from('activity_logs').delete().eq('workspace_id', ws.id)
    await supabase.from('workspaces').delete().eq('id', ws.id)
    // Switch to first remaining workspace
    const remaining = all.filter(w => w.id !== ws.id)
    if (remaining.length > 0) switchTo(remaining[0].id)
    else window.location.reload()
  }

  const accentColor = '#4C6FFF'`
)

// 4. Add delete button next to each workspace in dropdown (except first/default)
src = src.replace(
  `                    {workspace?.id===ws.id&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                  </button>`,
  `                    {workspace?.id===ws.id&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    {all.indexOf(ws) > 0 && (
                      <div onClick={e => deleteWorkspace(ws, e)} style={{ width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.4 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity='1', e.currentTarget.style.background='#e8403a22')}
                        onMouseLeave={e => (e.currentTarget.style.opacity='0.4', e.currentTarget.style.background='transparent')}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e8403a" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </div>
                    )}
                  </button>`
)

writeFileSync(resolve('components/sidebar.tsx'), src, 'utf8')
console.log('✅ Delete workspace added!')
