const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
class StripeService {
  async createCustomer(userId, email) { return await stripe.customers.create({ email, metadata: { userId } }); }
  async createSubscription(userId, planId, paymentMethod) {
    const prices = { pro: process.env.STRIPE_PRO_PRICE_ID, enterprise: process.env.STRIPE_ENT_PRICE_ID };
    return await stripe.subscriptions.create({ customer: paymentMethod.customerId, items: [{ price: prices[planId] }], payment_behavior: 'default_incomplete', expand: ['latest_invoice.payment_intent'] });
  }
  async cancelNow(subId) { return await stripe.subscriptions.del(subId); }
  async cancelAtPeriodEnd(subId) { return await stripe.subscriptions.update(subId, { cancel_at_period_end: true }); }
  async updateSubscription(subId, planId) { const sub = await stripe.subscriptions.retrieve(subId); return await stripe.subscriptions.update(subId, { items: [{ id: sub.items.data[0].id, price: planId }] }); }
  constructEvent(payload, sig) { return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET); }
}
module.exports = StripeService;
