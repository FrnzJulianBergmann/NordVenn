import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const path = resolve('components/sidebar.tsx')
let src = readFileSync(path, 'utf8')

// -- Step 1: Add UpgradeModal import --
if (!src.includes('UpgradeModal')) {
  src = src.replace(
    `import { useConfirm } from '@/components/confirm-dialog'`,
    `import { useConfirm } from '@/components/confirm-dialog'\nimport UpgradeModal from '@/components/upgrade-modal'`
  )
  console.log('✓ UpgradeModal import added')
} else {
  console.log('~ UpgradeModal already imported')
}

// -- Step 2: Add upgradeOpen state --
if (!src.includes('upgradeOpen')) {
  src = src.replace(
    `  const [creating, setCreating] = useState(false)`,
    `  const [creating, setCreating] = useState(false)\n  const [upgradeOpen, setUpgradeOpen] = useState(false)`
  )
  console.log('✓ upgradeOpen state added')
} else {
  console.log('~ upgradeOpen state already exists')
}

// -- Step 3: Add isPro derived value --
if (!src.includes('isPro')) {
  src = src.replace(
    `  const accentColor = '#4C6FFF'`,
    `  const isPro = (workspace as any)?.plan === 'pro'\n  const accentColor = '#4C6FFF'`
  )
  console.log('✓ isPro derived value added')
} else {
  console.log('~ isPro already exists')
}

// -- Step 4: Gate the Create Workspace button --
const OLD_BTN = `                <button onClick={() => { setWsOpen(false); setCreateOpen(true) }} style={{`
const NEW_BTN = `                <button onClick={() => {
                    setWsOpen(false)
                    if (!isPro && all.length >= 1) { setUpgradeOpen(true); return }
                    setCreateOpen(true)
                  }} style={{`

if (src.includes(OLD_BTN)) {
  src = src.replace(OLD_BTN, NEW_BTN)
  console.log('✓ Create Workspace button gated')
} else {
  console.log('✗ ERROR: Create Workspace button pattern not found — check sidebar.tsx')
  process.exit(1)
}

// -- Step 5: Add UpgradeModal JSX before Create Workspace Modal comment --
if (!src.includes('upgradeOpen} onClose')) {
  src = src.replace(
    `      {/* Create Workspace Modal */}`,
    `      <UpgradeModal\n        open={upgradeOpen}\n        onClose={() => setUpgradeOpen(false)}\n        reason="Free plan is limited to 1 workspace. Upgrade to Pro for unlimited workspaces."\n      />\n\n      {/* Create Workspace Modal */}`
  )
  console.log('✓ UpgradeModal JSX added')
} else {
  console.log('~ UpgradeModal JSX already exists')
}

writeFileSync(path, src, 'utf8')
console.log('\n✅ Part 1 done — workspace creation gated for Free plan')
console.log('   Free plan: max 1 workspace → upgrade modal on Create')
console.log('   Pro plan: unlimited workspaces')
