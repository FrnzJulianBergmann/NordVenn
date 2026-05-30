import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'app/login/page.tsx': `'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  const inp = (label:string, val:string, set:(v:string)=>void, type='text') => (
    <div style={{marginBottom:16}}>
      <label style={{display:'block',fontSize:11,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</label>
      <input type={type} value={val} onChange={e=>set(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&login()}
        style={{width:'100%',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',color:'var(--text-primary)',fontSize:14,outline:'none'}} />
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-base)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:360}}>
        <div style={{marginBottom:32,textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.5px'}}>VendorPilot</div>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:6}}>Sign in to your workspace</div>
        </div>
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:28}}>
          {inp('Email',email,setEmail,'email')}
          {inp('Password',password,setPassword,'password')}
          {error && <div style={{fontSize:12,color:'var(--danger)',marginBottom:14,padding:'8px 12px',background:'#ef444415',borderRadius:6}}>{error}</div>}
          <button onClick={login} disabled={loading} style={{width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:6,padding:'11px',fontSize:14,fontWeight:500,cursor:'pointer'}}>
            {loading?'Signing in...':'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
`,

'middleware.ts': `import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if(!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
`,
}

for (const [f,c] of Object.entries(files)) {
  const full = join(base,f)
  mkdirSync(dirname(full),{recursive:true})
  writeFileSync(full,c,'utf8')
  console.log('✓',f)
}
console.log('\n✅ Auth done. Aktifkan auth di Supabase dashboard dulu.')
