import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('app/login/page.tsx'), 'utf8')

// 1. Remove logo top left
src = src.replace(
  `        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'auto',position:'relative',zIndex:1}}>
          <NVLogo/>
          <span style={{fontSize:16,fontWeight:700,color:'#E6E8EC',letterSpacing:'-0.3px'}}>NordVenn</span>
        </div>`,
  `        {/* spacer */}
        <div style={{marginBottom:'auto'}}/>`
)

// 2. Remove globe background divs
src = src.replace(
  `        {/* Globe bg */}
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
        </div>`,
  ``
)

// 3. Remove FedRAMP/SOC2/ISO badges
src = src.replace(
  `        {/* Bottom badges */}
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:16}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#455065" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {['FedRAMP Ready','SOC 2 Type II','ISO 27001'].map((b,i) => (
            <span key={i} style={{fontSize:11,color:'#455065',display:'flex',alignItems:'center',gap:6}}>
              {i > 0 && <span style={{color:'#252f3d'}}>•</span>}{b}
            </span>
          ))}
        </div>`,
  ``
)

writeFileSync(resolve('app/login/page.tsx'), src, 'utf8')
console.log('✅ Login page cleaned up')
