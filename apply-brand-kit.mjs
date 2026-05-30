import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// ── 1. globals.css — sync colors to brand kit + Inter font ──────────────────
const css = `@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  /* Brand Kit — NordVenn */
  --bg-base:        #0B0E14;
  --bg-surface:     #11161D;
  --bg-elevated:    #1B222B;
  --bg-hover:       #222a35;
  --border:         #252f3d;
  --border-subtle:  #1a2130;

  --text-primary:   #E6E8EC;
  --text-secondary: #7a8599;
  --text-muted:     #455065;

  /* Brand Blue */
  --accent:         #4C6FFF;
  --accent-hover:   #7AA2FF;
  --accent-dim:     #4C6FFF18;

  --success:        #0ea871;
  --warning:        #e8970a;
  --danger:         #e8403a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: inherit; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Table row hover */
tr { transition: background 0.1s ease; }
tr:hover td { background: rgba(255,255,255,0.02) !important; }

/* Buttons */
button { transition: opacity 0.15s ease, transform 0.1s ease; }
button:hover { opacity: 0.85; }
button:active { transform: scale(0.97); }
a { transition: opacity 0.15s ease; }

/* Focus ring — brand blue */
input:focus, select:focus, textarea:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px var(--accent-dim);
}

/* Selection */
::selection { background: var(--accent); color: #fff; opacity: 0.3; }
`

writeFileSync(resolve('app/globals.css'), css, 'utf8')
console.log('✅ globals.css updated with NordVenn brand kit')

// ── 2. Patch sidebar.tsx — swap accent letter N → SVG NV monogram ────────────
const sidebarPath = resolve('components/sidebar.tsx')
let sidebar = readFileSync(sidebarPath, 'utf8')

// Replace the plain "N" letter logo with NV SVG mark
sidebar = sidebar.replace(
  `<div style={{width:26,height:26,background:'var(--accent)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>N</div>`,
  `<div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 20V4l8 12V4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 4v16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>`
)

// Replace NordVen → NordVenn (match brand kit spelling)
sidebar = sidebar.replace(
  `>NordVen<`,
  `>NordVenn<`
)

writeFileSync(sidebarPath, sidebar, 'utf8')
console.log('✅ Sidebar updated — NV monogram logo + NordVenn name')

// ── 3. Patch topbar.tsx — swap "A" avatar → gradient + update accent dot ─────
const topbarPath = resolve('components/topbar.tsx')
let topbar = readFileSync(topbarPath, 'utf8')

topbar = topbar.replace(
  `background: 'var(--accent)',\n          display: 'flex', alignItems: 'center', justifyContent: 'center',\n          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'`,
  `background: 'linear-gradient(135deg,#4C6FFF,#7AA2FF)',\n          display: 'flex', alignItems: 'center', justifyContent: 'center',\n          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'`
)

writeFileSync(topbarPath, topbar, 'utf8')
console.log('✅ Topbar avatar updated — brand gradient')

// ── 4. Patch sidebar.tsx bottom avatar ───────────────────────────────────────
sidebar = readFileSync(sidebarPath, 'utf8')
sidebar = sidebar.replace(
  `background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:700`,
  `background:'linear-gradient(135deg,#4C6FFF,#7AA2FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:700`
)
writeFileSync(sidebarPath, sidebar, 'utf8')
console.log('✅ Sidebar bottom avatar gradient applied')

console.log('\n🎨 NordVenn brand kit applied successfully!')
console.log('   · Color palette synced (#4C6FFF / #7AA2FF / dark blues)')
console.log('   · Inter font loaded from Google Fonts')
console.log('   · NV monogram SVG logo in sidebar')
console.log('   · Focus rings + text selection styled')
