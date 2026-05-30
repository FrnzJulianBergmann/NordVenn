import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const base = fileURLToPath(new URL('.', import.meta.url))

const files = {
'components/sidebar.tsx': `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mainNav = [
  { label: 'Overview', href: '/' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Documents', href: '/documents' },
]

const systemNav = [
  { label: 'Activity Log', href: '/activity' },
  { label: 'Settings', href: '/settings' },
]

const NavItem = ({ label, href, active }: { label: string; href: string; active: boolean }) => (
  <Link href={href} style={{
    display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'6px 10px',borderRadius:6,marginBottom:1,textDecoration:'none',fontSize:13,
    color:active?'var(--text-primary)':'var(--text-secondary)',
    background:active?'var(--bg-elevated)':'transparent',
    fontWeight:active?500:400,
    borderLeft:active?'2px solid var(--accent)':'2px solid transparent',
  }}>{label}</Link>
)

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{width:220,minHeight:'100vh',background:'var(--bg-surface)',borderRight:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:50}}>
      <div style={{padding:'16px',borderBottom:'1px solid var(--border-subtle)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <div style={{width:26,height:26,background:'var(--accent)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>N</div>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:'var(--text-primary)',letterSpacing:'-0.3px'}}>NordVen</div>
          </div>
        </div>
        <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:'var(--text-secondary)'}}>My Workspace</span>
          <span style={{color:'var(--text-muted)',fontSize:10}}>▾</span>
        </div>
      </div>

      <nav style={{padding:'10px 8px',flex:1,overflowY:'auto'}}>
        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',marginBottom:4}}>Workspace</div>
        {mainNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href} />
        ))}

        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',margin:'12px 0 4px'}}>System</div>
        {systemNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href} />
        ))}
      </nav>

      <div style={{padding:'12px 16px',borderTop:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:28,height:28,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:700}}>A</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:'var(--text-primary)',fontWeight:500}}>Admin</div>
          <div style={{fontSize:10,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Owner</div>
        </div>
      </div>
    </aside>
  )
}
`,

'app/(dashboard)/settings/page.tsx': `import Topbar from '@/components/topbar'

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Manage your workspace settings." />
      <div style={{padding:'0 24px',color:'var(--text-muted)',fontSize:13}}>Coming soon.</div>
    </>
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
console.log('\n✅ Sidebar v2 done.')
