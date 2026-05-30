import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/login/page.tsx'), 'utf8')

// 1. Add 'forgot' mode to state
src = src.replace(
  `  const [mode, setMode] = useState<'signin'|'signup'>('signin')`,
  `  const [mode, setMode] = useState<'signin'|'signup'|'forgot'>('signin')`
)

// 2. Add forgot password logic in submit
src = src.replace(
  `    if (mode === 'signin') {`,
  `    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      })
      if (error) setError(error.message)
      else setSuccess('Password reset link sent! Check your email.')
      setLoading(false)
      return
    }
    if (mode === 'signin') {`
)

// 3. Add NordVenn logo above title
src = src.replace(
  `          {/* Title */}
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{fontSize:24,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.5px',marginBottom:8}}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </div>
            <div style={{fontSize:14,color:'#7a8599'}}>
              {mode === 'signin' ? 'Sign in to your NordVenn workspace' : 'Start managing vendor compliance today'}
            </div>
          </div>`,
  `          {/* Title */}
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:9,marginBottom:16}}>
              <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V4l8 12V4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 4v16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{fontSize:15,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.3px'}}>NordVenn</span>
            </div>
            <div style={{fontSize:24,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.5px',marginBottom:8}}>
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </div>
            <div style={{fontSize:14,color:'#7a8599'}}>
              {mode === 'signin' ? 'Sign in to your NordVenn workspace' : mode === 'signup' ? 'Start managing vendor compliance today' : 'Enter your email to receive a reset link'}
            </div>
          </div>`
)

// 4. Show only email field in forgot mode
src = src.replace(
  `          {/* Fields */}
          <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:16}}>
            {mode === 'signup' && (`,
  `          {/* Fields */}
          <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:16}}>
            {mode === 'forgot' && (
              <div>
                <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>Email address</label>
                <div style={{position:'relative'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)'}}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="you@company.com"
                    style={{width:'100%',background:'#1B222B',border:'1px solid #252f3d',borderRadius:8,padding:'11px 14px 11px 40px',color:'#E6E8EC',fontSize:14,outline:'none'}}/>
                </div>
              </div>
            )}
            {mode !== 'forgot' && mode === 'signup' && (`
)

// 5. Hide email+password fields when in forgot mode
src = src.replace(
  `            <div>
              <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>Email address</label>`,
  `            {mode !== 'forgot' && <div>
              <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>Email address</label>`
)
src = src.replace(
  `              </div>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:12,color:'#7a8599',fontWeight:500}}>Password</label>
                {mode==='signin'&&<button onClick={()=>{}} style={{background:'none',border:'none',fontSize:12,color:'#4C6FFF',cursor:'pointer',padding:0}}>Forgot password?</button>}`,
  `              </div>
            </div>}
            {mode !== 'forgot' && <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:12,color:'#7a8599',fontWeight:500}}>Password</label>
                {mode==='signin'&&<button onClick={()=>{setMode('forgot');setError('');setSuccess('')}} style={{background:'none',border:'none',fontSize:12,color:'#4C6FFF',cursor:'pointer',padding:0}}>Forgot password?</button>}`
)

// close the password div wrapper
src = src.replace(
  `              </div>
            </div>
          </div>

          {error &&`,
  `              </div>
            </div>}
          </div>

          {error &&`
)

// 6. Update button label
src = src.replace(
  `{loading ? 'Please wait...' : mode==='signin' ? 'Sign in' : 'Create account'}`,
  `{loading ? 'Please wait...' : mode==='signin' ? 'Sign in' : mode==='signup' ? 'Create account' : 'Send reset link'}`
)

// 7. Update mode toggle for forgot
src = src.replace(
  `          {/* Mode toggle */}
          <div style={{textAlign:'center',marginBottom:28}}>
            <span style={{fontSize:13,color:'#7a8599'}}>
              {mode==='signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setError('');setSuccess('')}}
              style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
              {mode==='signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>`,
  `          {/* Mode toggle */}
          <div style={{textAlign:'center',marginBottom:28}}>
            {mode === 'forgot' ? (
              <button onClick={()=>{setMode('signin');setError('');setSuccess('')}}
                style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
                ← Back to sign in
              </button>
            ) : (
              <>
                <span style={{fontSize:13,color:'#7a8599'}}>
                  {mode==='signin' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setError('');setSuccess('')}}
                  style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
                  {mode==='signin' ? 'Create one' : 'Sign in'}
                </button>
              </>
            )}
          </div>`
)

writeFileSync(resolve('app/login/page.tsx'), src, 'utf8')
console.log('✅ Login — NordVenn branding + forgot password done!')
