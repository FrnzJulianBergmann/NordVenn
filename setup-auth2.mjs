import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'lib/supabase.ts': `import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(url, key, {
  auth: { persistSession: true, storageKey: 'vp-auth' }
})
`,

'middleware.ts': `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }
  const hasSession = req.cookies.getAll().some(c => c.name.includes('auth-token') || c.name.includes('vp-auth'))
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
`,

'app/login/page.tsx': `'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/'
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:360}}>
        <div style={{marginBottom:32,textAlign:'center'}}>
          <div style={{width:40,height:40,background:'var(--accent)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff',margin:'0 auto 12px'}}>V</div>
          <div style={{fontSize:20,fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.4px'}}>VendorPilot</div>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Sign in to your workspace</div>
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:28}}>
          {(['Email','Password'] as const).map((label,i)=>(
            <div key={label} style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
              <input
                type={i===1?'password':'email'}
                value={i===0?email:password}
                onChange={e=>i===0?setEmail(e.target.value):setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&login()}
                style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',color:'var(--text-primary)',fontSize:14,outline:'none'}}
              />
            </div>
          ))}
          {error && <div style={{fontSize:12,color:'var(--danger)',marginBottom:14,padding:'8px 12px',background:'#ef444415',borderRadius:6}}>{error}</div>}
          <button onClick={login} disabled={loading} style={{width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:11,fontSize:14,fontWeight:500,cursor:'pointer'}}>
            {loading?'Signing in...':'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
`,

'components/topbar.tsx': `'use client'
import { supabase } from '@/lib/supabase'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
  return (
    <div style={{padding:'20px 24px 0',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div>
        <h1 style={{fontSize:20,fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.4px'}}>{title}</h1>
        {subtitle && <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:3}}>{subtitle}</p>}
      </div>
      <button onClick={logout} style={{background:'none',border:'1px solid var(--border)',color:'var(--text-muted)',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>
        Sign out
      </button>
    </div>
  )
}
`,
}

for (const [f,c] of Object.entries(files)) {
  const full = join(base,f)
  mkdirSync(dirname(full),{recursive:true})
  writeFileSync(full,c,'utf8')
  console.log('✓',f)
}
console.log('\n✅ Auth fixed. Restart dev server lalu test login.')
