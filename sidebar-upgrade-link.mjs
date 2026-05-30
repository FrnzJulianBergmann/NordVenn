import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. Patch sidebar — add upgrade link ──────────────────────────────────────
const sidebarPath = resolve('components/sidebar.tsx')
let sidebar = readFileSync(sidebarPath, 'utf8')

// Add upgrade entry to systemNav — inject before closing nav tag
sidebar = sidebar.replace(
  `        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',margin:'12px 0 4px'}}>System</div>
        {systemNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href}/>
        ))}`,
  `        <div style={{fontSize:9,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,padding:'4px 8px',margin:'12px 0 4px'}}>System</div>
        {systemNav.map(({label,href})=>(
          <NavItem key={href} label={label} href={href} active={path===href}/>
        ))}

        {/* Upgrade CTA */}
        {!isPro && (
          <Link href="/upgrade" style={{
            display:'flex',alignItems:'center',gap:8,
            margin:'12px 4px 4px',padding:'8px 10px',
            borderRadius:8,textDecoration:'none',
            background:'linear-gradient(135deg,#1a1f3a,#0f1628)',
            border:'1px solid #4C6FFF40',
          }}>
            <div style={{width:22,height:22,borderRadius:6,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:'#7AA2FF',letterSpacing:'-0.1px'}}>Upgrade to Pro</div>
              <div style={{fontSize:10,color:'#455065',marginTop:1}}>$19/mo · Unlock all features</div>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4C6FFF" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        )}
        {isPro && (
          <Link href="/upgrade" style={{
            display:'flex',alignItems:'center',gap:8,
            margin:'12px 4px 4px',padding:'8px 10px',
            borderRadius:8,textDecoration:'none',
            background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)',
          }}>
            <span style={{fontSize:10,fontWeight:700,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>PRO</span>
            <span style={{fontSize:11,color:'var(--text-muted)'}}>Active plan</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{marginLeft:'auto'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        )}`
)

writeFileSync(sidebarPath, sidebar, 'utf8')
console.log('✅ Sidebar upgrade link added')

// ── 2. Patch settings — remove Plan Dev Mode section ────────────────────────
const settingsPath = resolve('app/(dashboard)/settings/page.tsx')
let settings = readFileSync(settingsPath, 'utf8')

// Remove the entire Plan Dev Mode section
const devModeStart = `\n          <Section title="Plan — Dev Mode">`
const devModeEnd = `          </Section>\n        </>`

const startIdx = settings.indexOf(devModeStart)
const endIdx = settings.indexOf(devModeEnd)

if (startIdx !== -1 && endIdx !== -1) {
  settings = settings.slice(0, startIdx) + '\n        </>' + settings.slice(endIdx + devModeEnd.length)
  console.log('✅ Dev Mode section removed from Settings')
} else {
  // Try alternate removal
  settings = settings.replace(/\n\s+<Section title="Plan — Dev Mode">[\s\S]*?<\/Section>/m, '')
  console.log('✅ Dev Mode section removed (alternate method)')
}

// Remove unused isPro and plan variables if they're only used for dev mode
writeFileSync(settingsPath, settings, 'utf8')
console.log('✅ Settings page cleaned up')

console.log('\n✅ Part 2 done!')
console.log('   · Sidebar: Upgrade CTA for Free, "PRO Active" for Pro')
console.log('   · Settings: Dev Mode section removed')
console.log('   · Visit /upgrade to manage plan')
