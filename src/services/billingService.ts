import Stripe from "stripe"
import { db } from "../db"
import { sendEmail } from "./emailService"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" })

export async function createSubscription(userId: string, priceId: string) {
  const user = await db.users.findById(userId)
  if (!user) throw new Error("User not found")

  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId } })
    customerId = customer.id
    await db.users.update(userId, { stripeCustomerId: customerId })
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  })

  await db.subscriptions.upsert({
    userId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    priceId,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  })

  return subscription
}

export async function cancelSubscription(userId: string) {
  const sub = await db.subscriptions.findByUser(userId)
  if (!sub) throw new Error("No active subscription")

  await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
  await db.subscriptions.update(sub.id, { cancelAtPeriodEnd: true })
  await sendEmail(userId, "subscription_cancelled")

  return { cancelled: true }
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice
      await db.invoices.create({ stripeInvoiceId: invoice.id, amount: invoice.amount_paid, status: "paid" })
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await db.subscriptions.updateByStripeId(sub.id, { status: "cancelled" })
      break
    }
  }
}
