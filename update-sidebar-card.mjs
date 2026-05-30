import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve('components/sidebar.tsx')
let src = readFileSync(path, 'utf8')

// 1. Add useEffect + supabase import
src = src.replace(
  `import Link from 'next/link'`,
  `import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'`
)

// 2. Add state inside component
src = src.replace(
  `const path = usePathname()`,
  `const path = usePathname()
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
  }, [])`
)

// 3. Replace bottom avatar section with business card
src = src.replace(
  `<div style={{padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:700}}>A</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500}}>Admin</div>
          <div style={{fontSize:10,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Owner</div>
        </div>
      </div>`,
  `<div style={{padding:'10px 10px 12px',borderTop:'1px solid var(--border-subtle)'}}>
        <div style={{
          background:'#ffffff',borderRadius:10,padding:'14px 14px 12px',
          boxShadow:'0 2px 12px rgba(0,0,0,0.35)',position:'relative',overflow:'hidden'
        }}>
          {/* NV watermark */}
          <div style={{position:'absolute',right:-4,bottom:-6,opacity:0.07}}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V4l8 12V4" stroke="#4C6FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4v16" stroke="#4C6FFF" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          {/* Name & role */}
          <div style={{fontSize:13,fontWeight:700,color:'#0f0f1a',letterSpacing:'-0.2px',marginBottom:2}}>
            {user?.user_metadata?.full_name || 'Admin'}
          </div>
          <div style={{fontSize:11,color:'#7a8599',marginBottom:10}}>
            {user?.user_metadata?.role || 'Head of Operations'}
          </div>
          {/* Contact rows */}
          {[
            { icon:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', val: user?.email || '' },
            { icon:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13 19.79 19.79 0 0 1 1.08 4.18 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z', val: user?.user_metadata?.phone || '+1 (415) 555-0198' },
            { icon:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', val: 'nordvenn.com' },
          ].filter(r => r.val).map((r, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2" style={{flexShrink:0}}>
                <path d={r.icon}/>
              </svg>
              <span style={{fontSize:10,color:'#5a6478',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>`
)

writeFileSync(path, src, 'utf8')
console.log('✅ Sidebar business card updated!')
