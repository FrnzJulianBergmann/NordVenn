import { supabase } from './supabase'

export async function getOrCreateWorkspace() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get workspaces for user
  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at')

  if (data && data.length > 0) {
    // Check if active workspace in localStorage
    const activeId = localStorage.getItem('active_workspace_id')
    const active = data.find(w => w.id === activeId) || data[0]
    if (!activeId) localStorage.setItem('active_workspace_id', active.id)
    return { workspace: active, all: data }
  }

  // Create default workspace
  const { data: created } = await supabase
    .from('workspaces')
    .insert({ name: 'My Workspace', owner_id: user.id })
    .select()
    .single()

  if (created) localStorage.setItem('active_workspace_id', created.id)
  return { workspace: created, all: [created] }
}

export function getActiveWorkspaceId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('active_workspace_id')
}

export function setActiveWorkspaceId(id: string) {
  localStorage.setItem('active_workspace_id', id)
}
