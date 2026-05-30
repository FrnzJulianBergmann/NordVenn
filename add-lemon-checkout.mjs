import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

const VARIANT_ID = '1711273'
const LEMON_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJhYjNlZGU0NWFkMzFjZDc1MDQwYjY1MzU0NzQzOTIzZDJiMTBlZDAyODFlOWYxOWE1YzIzNjhiMDQ5MTQyNzdjZTJjMjQ2NTc1MTY2YWE2MyIsImlhdCI6MTc3OTg3ODU1Ny4wNTQ1NywibmJmIjoxNzc5ODc4NTU3LjA1NDU3MiwiZXhwIjoyNDA0MDgwMDAwLjAzNDEzMSwic3ViIjoiNzIyNjA5MyIsInNjb3BlcyI6W119.Dbg3si0-FZjKrCXjmPeVmxlk15VyRPT71Tzs9uHczksQD0tsKlOg4t31YNn2B2jPzPe-iIP5ueX9TbTyqWYv2X2H50ketongQIWsfA2WhIbSKoOHB29sxX8J_ChFc92jWwSwmXbPfKWSPzXb2QAv8GrpxUa58Bw2HSSHbKuXjXGYMUCsOzU8mJdPGrWDJSF6jZw7QnSEU4-H5_zUQxttFgp4dUj2woAzjpjxqr2HwIJp3fN9ZcQQXOlMdxz8ZpeEYWeHmImpcwi13aLePptMR1W2LG05lp--5g3s1nwmSx24z7VYFbu8H_J41ZVpA0NEcZeu-cGW3tRk-9fX375v3uggDtZjoRklIYI7jr6l7QY1nwEOJTDbVaX5suDnNnH7rbx51l630yCWsOfhfbI439k4VOpk8f9UakMoDcQIYmO2cojkTbuCcWk0jXhSWG42zdHnNR30LiA8iQHpFgz1oJjVJLCr-GbgSYgF_D_X9vLvjI4qkoqx2ySE7OyevjxacOky2ZvwmsbfG-zppL6a-4bRFNgAVHLP0Mp5QtVYHAwN98i9pMSOjCQUMoXqMjxAaWM53EFrZpst9MEpPhRu1hEcFwso0QusBeqhGEpRasX7xRmbcw3b-CWhg5oGcuFpQUzHlxVFosV98iJoF8-ecZJm_1sDg6dFg6tS8DcQVpw'

// ── 1. Create Supabase Edge Function for checkout ────────────────────────────
const { mkdirSync } = await import('fs')
mkdirSync(resolve('supabase/functions/create-checkout'), { recursive: true })

const checkoutFn = `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LEMON_API_KEY = Deno.env.get('LEMON_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const VARIANT_ID = '${VARIANT_ID}'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { workspace_id, user_email } = await req.json()
    if (!workspace_id || !user_email) {
      return new Response(JSON.stringify({ error: 'Missing workspace_id or user_email' }), { status: 400, headers: corsHeaders })
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${LEMON_API_KEY}\`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user_email,
              custom: { workspace_id },
            },
            product_options: {
              redirect_url: 'https://nordvenn.vercel.app/upgrade?success=true',
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: '${1092485}' } },
            variant: { data: { type: 'variants', id: '${VARIANT_ID}' } },
          },
        },
      }),
    })

    const data = await response.json()
    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      console.error('Lemon response:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: 'No checkout URL', data }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ url: checkoutUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
`
writeFileSync(resolve('supabase/functions/create-checkout/index.ts'), checkoutFn, 'utf8')
console.log('✅ create-checkout function created')

// ── 2. Patch upgrade page — replace activate() with real checkout ─────────────
let upgradePage = readFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), 'utf8')

// Add supabase import if not there
if (!upgradePage.includes("import { supabase }")) {
  upgradePage = upgradePage.replace(
    `'use client'`,
    `'use client'`
  )
}

// Replace the activate function with real checkout
upgradePage = upgradePage.replace(
  `  const activate = async (p: 'free' | 'pro') => {
    if (!workspace) return
    setLoading(true)
    await supabase.from('workspaces').update({ plan: p }).eq('id', workspace.id)
    await refresh()
    toast.success(p === 'pro' ? '✨ Pro activated!' : 'Switched to Free')
    setLoading(false)
    router.push('/')
  }`,
  `  const activate = async (p: 'free' | 'pro') => {
    if (!workspace) return
    setLoading(true)

    if (p === 'pro') {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { toast.error('Could not get user email'); setLoading(false); return }

      // Create Lemon Squeezy checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { workspace_id: workspace.id, user_email: user.email },
      })

      if (error || !data?.url) {
        toast.error('Could not create checkout. Try again.')
        setLoading(false)
        return
      }

      // Redirect to Lemon Squeezy
      window.location.href = data.url
      return
    }

    // Downgrade to free
    await supabase.from('workspaces').update({ plan: 'free' }).eq('id', workspace.id)
    await refresh()
    toast.success('Switched to Free')
    setLoading(false)
    router.push('/')
  }`
)

// Handle success redirect
upgradePage = upgradePage.replace(
  `  const [loading, setLoading] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState(false)`,
  `  const [loading, setLoading] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState(false)

  // Handle success redirect from Lemon Squeezy
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        toast.success('✨ Welcome to Pro! Your plan will activate shortly.')
        router.replace('/upgrade')
      }
    }
  }, [])`
)

// Add React import
if (!upgradePage.includes("import React")) {
  upgradePage = upgradePage.replace(
    `'use client'\nimport { useState }`,
    `'use client'\nimport React, { useState }`
  )
}

writeFileSync(resolve('app/(dashboard)/upgrade/page.tsx'), upgradePage, 'utf8')
console.log('✅ Upgrade page patched with real Lemon Squeezy checkout')

// ── 3. Add LEMON_API_KEY to .env.local note ──────────────────────────────────
console.log('\n📋 Next steps:')
console.log('1. Add to Supabase Edge Function Secrets:')
console.log('   LEMON_API_KEY = (your Lemon Squeezy API key)')
console.log('\n2. Deploy new function:')
console.log('   npx supabase functions deploy create-checkout --no-verify-jwt')
console.log('\n3. Test by clicking "Upgrade to Pro" on /upgrade page')
