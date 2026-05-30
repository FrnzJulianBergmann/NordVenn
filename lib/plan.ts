export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    limits: { vendors: 5 },
    features: {
      audit_export: false,
      advanced_analytics: false,
      full_notifications: false,
      unlimited_vendors: false,
    },
  },
  pro: {
    label: 'Pro',
    price: 19,
    limits: { vendors: Infinity },
    features: {
      audit_export: true,
      advanced_analytics: true,
      full_notifications: true,
      unlimited_vendors: true,
    },
  },
} as const

export type Plan = keyof typeof PLANS

export function getPlanFeatures(plan: string) {
  return PLANS[(plan as Plan) || 'free'] ?? PLANS.free
}
