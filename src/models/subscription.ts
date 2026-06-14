export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  status: "active" | "cancelled" | "past_due" | "trialing"
  priceId: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  stripeInvoiceId: string
  amount: number
  status: "paid" | "open" | "void"
  createdAt: Date
}
