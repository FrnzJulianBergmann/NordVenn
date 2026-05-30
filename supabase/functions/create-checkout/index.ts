import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LEMON_API_KEY = Deno.env.get('LEMON_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const VARIANT_ID = '1711273'

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
        'Authorization': `Bearer ${LEMON_API_KEY}`,
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
            store: { data: { type: 'stores', id: '1092485' } },
            variant: { data: { type: 'variants', id: '1711273' } },
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
