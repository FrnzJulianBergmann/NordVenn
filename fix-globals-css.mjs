import { writeFileSync } from 'fs'
import { resolve } from 'path'

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

:root {
  --bg-base:        #0B0E14;
  --bg-surface:     #11161D;
  --bg-elevated:    #1B222B;
  --bg-hover:       #222a35;
  --border:         #252f3d;
  --border-subtle:  #1a2130;
  --text-primary:   #E6E8EC;
  --text-secondary: #7a8599;
  --text-muted:     #455065;
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

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

tr { transition: background 0.1s ease; }
tr:hover td { background: rgba(255,255,255,0.02) !important; }

button { transition: opacity 0.15s ease, transform 0.1s ease; }
button:hover { opacity: 0.85; }
button:active { transform: scale(0.97); }
a { transition: opacity 0.15s ease; }

input:focus, select:focus, textarea:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px #4C6FFF18;
}

::selection { background: #4C6FFF55; color: #fff; }
`

writeFileSync(resolve('app/globals.css'), css, 'utf8')
console.log('✅ globals.css fixed — @import order corrected')
