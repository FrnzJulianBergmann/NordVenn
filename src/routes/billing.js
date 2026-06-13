const express = require('express');
const router = express.Router();
router.post('/subscribe', async (req, res) => {
  const sub = await req.subscriptionService.subscribe(req.user.id, req.body.planId, req.body.paymentMethod);
  res.json({ success: true, subscription: sub });
});
router.delete('/subscribe', async (req, res) => {
  await req.subscriptionService.cancel(req.user.id, { immediate: req.body.immediate });
  res.json({ success: true });
});
router.put('/subscribe/upgrade', async (req, res) => {
  await req.subscriptionService.upgrade(req.user.id, req.body.planId);
  res.json({ success: true });
});
router.get('/subscribe/status', async (req, res) => {
  const sub = await req.db.subscriptions.findActive(req.user.id);
  res.json(sub ?? { planId: 'free', status: 'active' });
});
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = req.stripeService.constructEvent(req.body, req.headers['stripe-signature']);
  if (event.type === 'invoice.payment_failed') await req.subscriptionService.handlePaymentFailure(event.data.object);
  if (event.type === 'customer.subscription.deleted') await req.subscriptionService.handleCancellation(event.data.object);
  res.json({ received: true });
});
module.exports = router;
