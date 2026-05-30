import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/login/page.tsx'), 'utf8')

// 1. Add 'reset' mode
src = src.replace(
  `  const [mode, setMode] = useState<'signin'|'signup'|'forgot'>('signin')`,
  `  const [mode, setMode] = useState<'signin'|'signup'|'forgot'|'reset'>('signin')`
)

// 2. Add newPassword state
src = src.replace(
  `  const [showPass, setShowPass] = useState(false)`,
  `  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)`
)

// 3. Detect reset token from URL on mount
src = src.replace(
  `  const submit = async () => {`,
  `  // Detect password reset session from email link
  useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('type=recovery')) {
        setMode('reset')
      }
    }
  })

  const submit = async () => {`
)

// 4. Add reset password handler in submit
src = src.replace(
  `    if (mode === 'forgot') {`,
  `    if (mode === 'reset') {
      if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccess('Password updated! Redirecting...'); setTimeout(() => window.location.href = '/', 1500) }
      setLoading(false)
      return
    }
    if (mode === 'forgot') {`
)

// 5. Add reset form UI — inject before forgot check in Fields section
src = src.replace(
  `            {mode === 'forgot' && (`,
  `            {mode === 'reset' && (
              <div>
                <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>New password</label>
                <div style={{position:'relative'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)'}}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type={showPass?'text':'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Min. 8 characters"
                    style={{width:'100%',background:'#1B222B',border:'1px solid #252f3d',borderRadius:8,padding:'11px 14px 11px 40px',color:'#E6E8EC',fontSize:14,outline:'none'}}/>
                  <button onClick={()=>setShowPass(s=>!s)} style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:0}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2">
                      {showPass
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                <div style={{fontSize:11,color:'#455065',marginTop:6}}>Must be at least 8 characters</div>
              </div>
            )}
            {mode === 'forgot' && (`
)

// 6. Update title for reset mode
src = src.replace(
  `              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}`,
  `              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Set new password' : 'Reset password'}`
)
src = src.replace(
  `              {mode === 'signin' ? 'Sign in to your NordVenn workspace' : mode === 'signup' ? 'Start managing vendor compliance today' : 'Enter your email to receive a reset link'}`,
  `              {mode === 'signin' ? 'Sign in to your NordVenn workspace' : mode === 'signup' ? 'Start managing vendor compliance today' : mode === 'reset' ? 'Choose a strong new password' : 'Enter your email to receive a reset link'}`
)

// 7. Update button label for reset
src = src.replace(
  `{loading ? 'Please wait...' : mode==='signin' ? 'Sign in' : mode==='signup' ? 'Create account' : 'Send reset link'}`,
  `{loading ? 'Please wait...' : mode==='signin' ? 'Sign in' : mode==='signup' ? 'Create account' : mode==='reset' ? 'Update password' : 'Send reset link'}`
)

// 8. Hide mode toggle for reset mode
src = src.replace(
  `          {mode === 'forgot' ? (`,
  `          {mode === 'reset' ? null : mode === 'forgot' ? (`
)
src = src.replace(
  `            ) : (
              <>
                <span style={{fontSize:13,color:'#7a8599'}}>
                  {mode==='signin' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setError('');setSuccess('')}}
                  style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
                  {mode==='signin' ? 'Create one' : 'Sign in'}
                </button>
              </>
            )}`,
  `            ) : (
              <>
                <span style={{fontSize:13,color:'#7a8599'}}>
                  {mode==='signin' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setError('');setSuccess('')}}
                  style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
                  {mode==='signin' ? 'Create one' : 'Sign in'}
                </button>
              </>
            )}`
)

writeFileSync(resolve('app/login/page.tsx'), src, 'utf8')
console.log('✅ Password reset handler added!')
