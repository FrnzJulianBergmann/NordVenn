// Jalankan ini dari root folder NordVen
// Prerequisites: Supabase CLI sudah terinstall
// Install: npm install -g supabase

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const fnSrc = resolve('supabase/functions/send-expiry-reminders')

if (!existsSync(fnSrc)) {
  console.error('❌ Folder supabase/functions/send-expiry-reminders not found')
  console.log('   Pastikan kamu sudah copy folder dari output ke project root dulu')
  process.exit(1)
}

try {
  console.log('🚀 Deploying Edge Function...')
  execSync('npx supabase functions deploy send-expiry-reminders --no-verify-jwt', { stdio: 'inherit' })
  console.log('\n✅ Edge Function deployed!')
  console.log('\n📋 Next steps:')
  console.log('   1. Buka Supabase Dashboard → Edge Functions → send-expiry-reminders')
  console.log('   2. Copy the function URL')
  console.log('   3. Setup cron di Supabase → Database → Extensions → pg_cron')
  console.log('      atau pakai: https://cron-job.org (gratis)')
  console.log('\n   Cron schedule untuk tiap pagi jam 8:')
  console.log('   0 8 * * *')
} catch (e) {
  console.error('❌ Deploy failed:', e.message)
  console.log('\n   Pastikan Supabase CLI terinstall: npm install -g supabase')
  console.log('   Login dulu: npx supabase login')
}
