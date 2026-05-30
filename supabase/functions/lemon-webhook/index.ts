import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('LEMON_WEBHOOK_SECRET')!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

serve(async (req) => {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature') || ''

    // Verify webhook signature
    const hmac = createHmac('sha256', WEBHOOK_SECRET)
    hmac.update(rawBody)
    const digest = hmac.digest('hex')

    if (digest !== signature) {
      return new Response('Invalid signature', { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta?.event_name
    const customData = payload.meta?.custom_data
    const workspaceId = customData?.workspace_id

    console.log('Event:', eventName, 'Workspace:', workspaceId)

    if (!workspaceId) {
      return new Response(JSON.stringify({ error: 'No workspace_id in custom_data' }), { status: 200 })
    }

    // Handle subscription events
    if ([
      'subscription_created',
      'subscription_updated',
      'subscription_payment_success',
    ].includes(eventName)) {
      const status = payload.data?.attributes?.status
      const plan = status === 'active' ? 'pro' : 'free'

      await supabase
        .from('workspaces')
        .update({ plan })
        .eq('id', workspaceId)

      console.log(`Workspace ${workspaceId} → ${plan}`)
    }

    if (['subscription_cancelled', 'subscription_expired'].includes(eventName)) {
      await supabase
        .from('workspaces')
        .update({ plan: 'free' })
        .eq('id', workspaceId)

      console.log(`Workspace ${workspaceId} → free (cancelled)`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})