class SubscriptionService {
  constructor(db, paymentGateway, emailService) {
    this.db = db; this.payment = paymentGateway; this.email = emailService;
    this.plans = { free: { price: 0, seats: 1 }, pro: { price: 29, seats: 5 }, enterprise: { price: 199, seats: 999 } };
  }
  async subscribe(userId, planId, paymentMethod) {
    const plan = this.plans[planId];
    if (!plan) throw new Error('Invalid plan');
    const existing = await this.db.subscriptions.findActive(userId);
    if (existing) await this.cancel(userId, { immediate: false });
    const charge = await this.payment.createSubscription(userId, planId, paymentMethod);
    const sub = await this.db.subscriptions.create({ userId, planId, stripeSubId: charge.id, status: 'active', currentPeriodEnd: charge.current_period_end });
    await this.email.send(userId, 'subscription_started', { plan: planId });
    return sub;
  }
  async cancel(userId, opts = {}) {
    const sub = await this.db.subscriptions.findActive(userId);
    if (!sub) throw new Error('No active subscription');
    if (opts.immediate) { await this.payment.cancelNow(sub.stripeSubId); await sub.update({ status: 'cancelled' }); }
    else { await this.payment.cancelAtPeriodEnd(sub.stripeSubId); await sub.update({ cancelAtPeriodEnd: true }); }
    await this.email.send(userId, 'subscription_cancelled', { immediate: opts.immediate });
  }
  async upgrade(userId, newPlanId) {
    const sub = await this.db.subscriptions.findActive(userId);
    await this.payment.updateSubscription(sub.stripeSubId, newPlanId);
    await sub.update({ planId: newPlanId });
  }
}
