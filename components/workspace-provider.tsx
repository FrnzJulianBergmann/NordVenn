'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateWorkspace, setActiveWorkspaceId } from '@/lib/workspace'

type WS = { id: string; name: string; owner_id: string; plan: string }
type Ctx = { workspace: WS | null; all: WS[]; switchTo: (id: string) => void; refresh: () => void }

const WorkspaceCtx = createContext<Ctx>({ workspace: null, all: [], switchTo: () => {}, refresh: () => {} })

export const useWorkspace = () => useContext(WorkspaceCtx)

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WS | null>(null)
  const [all, setAll] = useState<WS[]>([])

  const load = async () => {
    const res = await getOrCreateWorkspace()
    if (res) { setWorkspace(res.workspace); setAll(res.all) }
  }

  const switchTo = (id: string) => {
    setActiveWorkspaceId(id)
    const ws = all.find(w => w.id === id)
    if (ws) setWorkspace(ws)
    window.location.reload()
  }

  useEffect(() => { load() }, [])

  return (
    <WorkspaceCtx.Provider value={{ workspace, all, switchTo, refresh: load }}>
      {children}
    </WorkspaceCtx.Provider>
  )
}
