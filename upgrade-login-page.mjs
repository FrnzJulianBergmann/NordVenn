import { writeFileSync } from 'fs'
import { resolve } from 'path'

const content = `'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const NVLogo = () => (
  <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V4l8 12V4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 4v16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  </div>
)

const features = [
  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Vendor Risk Management', sub: 'Continuously assess and monitor vendor compliance and performance.' },
  { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6', title: 'Document Intelligence', sub: 'Automate document collection, expiration tracking, and alerts.' },
  { icon: 'M18 20V10 M12 20V4 M6 20v-6', title: 'Real-time Insights', sub: 'Get a 360° view of compliance health across your ecosystem.' },
]

export default function LoginPage() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setSuccess(''); setLoading(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else window.location.href = '/'
    } else {
      if (!name.trim()) { setError('Full name is required'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, company } }
      })
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccess('Account created! Check your email to confirm.'); setLoading(false) }
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0B0E14',display:'flex',fontFamily:"'Inter',-apple-system,sans-serif",WebkitFontSmoothing:'antialiased'}}>

      {/* ── Left panel ── */}
      <div style={{flex:1,position:'relative',display:'flex',flexDirection:'column',padding:'36px 48px',overflow:'hidden',minWidth:0}}>
        {/* Globe bg */}
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{
            position:'absolute',bottom:-120,left:'50%',transform:'translateX(-30%)',
            width:700,height:700,borderRadius:'50%',
            background:'radial-gradient(ellipse at 60% 40%, #1a2a6c44 0%, #0B0E1400 70%)',
          }}/>
          <div style={{
            position:'absolute',bottom:-80,left:'20%',
            width:600,height:600,borderRadius:'50%',
            border:'1px solid #4C6FFF15',
            boxShadow:'inset 0 0 80px #4C6FFF08',
          }}/>
          <div style={{
            position:'absolute',bottom:-40,left:'25%',
            width:500,height:500,borderRadius:'50%',
            border:'1px solid #4C6FFF10',
          }}/>
          <div style={{
            position:'absolute',bottom:20,left:'30%',
            width:400,height:400,borderRadius:'50%',
            border:'1px solid #4C6FFF08',
          }}/>
          {/* glow dot */}
          <div style={{position:'absolute',bottom:'32%',left:'52%',width:14,height:14,borderRadius:'50%',background:'#4C6FFF',boxShadow:'0 0 24px 8px #4C6FFF80'}}/>
          <div style={{position:'absolute',bottom:'28%',left:'38%',width:6,height:6,borderRadius:'50%',background:'#7AA2FF',boxShadow:'0 0 12px 4px #7AA2FF60'}}/>
        </div>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'auto',position:'relative',zIndex:1}}>
          <NVLogo/>
          <span style={{fontSize:16,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.3px'}}>NordVenn</span>
        </div>

        {/* Hero text */}
        <div style={{position:'relative',zIndex:1,marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,color:'#4C6FFF',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:16}}>Vendor Onboarding & Compliance</div>
          <div style={{fontSize:42,fontWeight:800,color:'#E6E8EC',letterSpacing:'-1px',lineHeight:1.1,marginBottom:16}}>
            Secure. Compliant.<br/>
            <span style={{background:'linear-gradient(90deg,#4C6FFF,#7AA2FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Mission-Ready.</span>
          </div>
          <div style={{fontSize:14,color:'#7a8599',lineHeight:1.7,maxWidth:380}}>
            NordVenn helps organizations manage vendor risk, track compliance, and stay audit-ready — all in one secure platform.
          </div>
        </div>

        {/* Features */}
        <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:20,marginBottom:40}}>
          {features.map((f,i) => (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:'#4C6FFF14',border:'1px solid #4C6FFF25',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon}/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'#E6E8EC',marginBottom:3}}>{f.title}</div>
                <div style={{fontSize:12,color:'#7a8599',lineHeight:1.6}}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badges */}
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:16}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {['FedRAMP Ready','SOC 2 Type II','ISO 27001'].map((b,i) => (
            <span key={i} style={{fontSize:11,color:'#455065',display:'flex',alignItems:'center',gap:6}}>
              {i > 0 && <span style={{color:'#252f3d'}}>•</span>}{b}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{width:520,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 48px',position:'relative'}}>
        <div style={{
          position:'absolute',inset:0,
          background:'linear-gradient(180deg,#11161D 0%,#0d1117 100%)',
          borderLeft:'1px solid #1a2130',
        }}/>
        <div style={{width:'100%',maxWidth:400,position:'relative',zIndex:1}}>

          {/* Title */}
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{fontSize:24,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.5px',marginBottom:8}}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </div>
            <div style={{fontSize:14,color:'#7a8599'}}>
              {mode === 'signin' ? 'Sign in to your NordVenn workspace' : 'Start managing vendor compliance today'}
            </div>
          </div>

          {/* Fields */}
          <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:16}}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jordan Hayes"
                    style={{width:'100%',background:'#1B222B',border:'1px solid #252f3d',borderRadius:8,padding:'11px 14px',color:'#E6E8EC',fontSize:14,outline:'none'}}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,color:'#7a8599',marginBottom:6,fontWeight:500}}>Company <span style={{color:'#455065'}}>(optional)</span></label>
                  <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Acme Corp"
                    style={{width:'100%',background:'#1B222B',border:'1px solid #252f3d',borderRadius:8,padding:'11px 14px',color:'#E6E8EC',fontSize:14,outline:'none'}}/>
                </div>
              </>
            )}
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
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:12,color:'#7a8599',fontWeight:500}}>Password</label>
                {mode==='signin'&&<button onClick={()=>{}} style={{background:'none',border:'none',fontSize:12,color:'#4C6FFF',cursor:'pointer',padding:0}}>Forgot password?</button>}
              </div>
              <div style={{position:'relative'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)'}}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Enter your password"
                  style={{width:'100%',background:'#1B222B',border:'1px solid #252f3d',borderRadius:8,padding:'11px 40px 11px 40px',color:'#E6E8EC',fontSize:14,outline:'none'}}/>
                <button onClick={()=>setShowPass(s=>!s)} style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && <div style={{fontSize:12,color:'#e8403a',marginBottom:14,padding:'10px 14px',background:'#e8403a12',border:'1px solid #e8403a25',borderRadius:7}}>{error}</div>}
          {success && <div style={{fontSize:12,color:'#0ea871',marginBottom:14,padding:'10px 14px',background:'#0ea87112',border:'1px solid #0ea87125',borderRadius:7}}>{success}</div>}

          {/* Sign in button */}
          <button onClick={submit} disabled={loading} style={{
            width:'100%',background:'linear-gradient(135deg,#4C6FFF,#5d7fff)',color:'#fff',border:'none',
            borderRadius:8,padding:'13px',fontSize:14,fontWeight:600,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            opacity:loading?0.7:1,marginBottom:20,
            boxShadow:'0 4px 16px #4C6FFF30',
          }}>
            {loading ? 'Please wait...' : mode==='signin' ? 'Sign in' : 'Create account'}
            {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:'#1a2130'}}/>
            <span style={{fontSize:12,color:'#455065'}}>or</span>
            <div style={{flex:1,height:1,background:'#1a2130'}}/>
          </div>

          {/* Mode toggle */}
          <div style={{textAlign:'center',marginBottom:28}}>
            <span style={{fontSize:13,color:'#7a8599'}}>
              {mode==='signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setError('');setSuccess('')}}
              style={{background:'none',border:'none',fontSize:13,color:'#4C6FFF',cursor:'pointer',fontWeight:600,padding:0}}>
              {mode==='signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>

          {/* Security note */}
          <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:'#1B222B',border:'1px solid #1a2130',borderRadius:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#E6E8EC',marginBottom:2}}>Your data is encrypted and secure</div>
              <div style={{fontSize:11,color:'#7a8599'}}>We never share your information with third parties.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`

writeFileSync(resolve('app/login/page.tsx'), content, 'utf8')
console.log('✅ Login page upgraded!')
