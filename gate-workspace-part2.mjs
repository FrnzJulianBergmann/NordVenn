// Part 2 — Verify the gating is working correctly
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(resolve('components/sidebar.tsx'), 'utf8')

const checks = [
  { label: 'UpgradeModal imported',        pass: src.includes("import UpgradeModal") },
  { label: 'upgradeOpen state',            pass: src.includes("upgradeOpen") },
  { label: 'isPro derived value',          pass: src.includes("isPro") },
  { label: 'Gate logic on Create button',  pass: src.includes("all.length >= 1") },
  { label: 'UpgradeModal JSX in render',   pass: src.includes("open={upgradeOpen}") },
]

console.log('\n📋 Verification Report — Workspace Gating\n')
let allPass = true
checks.forEach(c => {
  const icon = c.pass ? '✅' : '❌'
  console.log(`  ${icon}  ${c.label}`)
  if (!c.pass) allPass = false
})

console.log('')
if (allPass) {
  console.log('✅ All checks passed!')
  console.log('\n📌 What to test:')
  console.log('   1. Set plan to FREE in Settings → Workspace → Dev Mode')
  console.log('   2. Open workspace dropdown → click "+ Create Workspace"')
  console.log('   3. Should see Upgrade Modal (not the create form)')
  console.log('   4. Set plan to PRO → try again → Create form should open normally')
} else {
  console.log('❌ Some checks failed — run part1 again or check sidebar.tsx manually')
}
