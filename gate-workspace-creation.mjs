import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

let src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

// 1. Add upgradeOpen state
src = src.replace(
  `  const [creating, setCreating] = useState(false)`,
  `  const [creating, setCreating] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)`
)

// 2. Add UpgradeModal import
src = src.replace(
  `import { useConfirm } from '@/components/confirm-dialog'`,
  `import { useConfirm } from '@/components/confirm-dialog'
import UpgradeModal from '@/components/upgrade-modal'`
)

// 3. Get plan from workspace
src = src.replace(
  `  const accentColor = '#4C6FFF'`,
  `  const isPro = (workspace as any)?.plan === 'pro'
  const accentColor = '#4C6FFF'`
)

// 4. Gate Create Workspace button
src = src.replace(
  `                <button onClick={() => { setWsOpen(false); setCreateOpen(true) }} style={{`,
  `                <button onClick={() => {
                    setWsOpen(false)
                    if (!isPro && all.length >= 1) { setUpgradeOpen(true); return }
                    setCreateOpen(true)
                  }} style={{`
)

// 5. Add UpgradeModal before closing </aside>
src = src.replace(
  `      {/* Create Workspace Modal */}`,
  `      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="Free plan is limited to 1 workspace. Upgrade to Pro for unlimited workspaces." />

      {/* Create Workspace Modal */}`
)

writeFileSync(resolve('components/sidebar.tsx'), src, 'utf8')
console.log('✅ Workspace creation gated for Free plan!')
