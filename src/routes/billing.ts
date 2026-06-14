import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { createSubscription, cancelSubscription, handleWebhook } from "../services/billingService"

const router = Router()

router.post("/subscribe", requireAuth, async (req, res, next) => {
  try {
    const { priceId } = req.body
    const sub = await createSubscription(req.user!.id, priceId)
    res.json({ subscriptionId: sub.id, clientSecret: (sub.latest_invoice as any)?.payment_intent?.client_secret })
  } catch (err) { next(err) }
})

router.delete("/subscribe", requireAuth, async (req, res, next) => {
  try {
    const result = await cancelSubscription(req.user!.id)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/webhook", async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"] as string
    const event = require("stripe").webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    await handleWebhook(event)
    res.json({ received: true })
  } catch (err) { next(err) }
})

export default router
