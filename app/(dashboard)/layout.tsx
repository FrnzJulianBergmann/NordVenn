'use client'
import { CommandPalette } from '@/components/command-palette'
import ConfirmProvider from '@/components/confirm-dialog'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/sidebar'
import Toaster from '@/components/toast'
import WorkspaceProvider from '@/components/workspace-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
    })
  }, [])

  return (
    <WorkspaceProvider>
      <ConfirmProvider>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <CommandPalette />
          <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg-base)', maxWidth: 'calc(100vw - 220px)', borderRadius: '10px 0 0 10px', overflow: 'hidden' }}>
            {children}
          </main>
          <Toaster />
        </div>
      </ConfirmProvider>
    </WorkspaceProvider>
  )
}
