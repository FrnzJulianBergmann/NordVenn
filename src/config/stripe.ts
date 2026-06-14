export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  prices: {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
  },
}
