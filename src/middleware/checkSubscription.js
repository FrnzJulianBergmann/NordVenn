const checkSubscription = (requiredPlan = 'pro') => async (req, res, next) => {
  const sub = await req.db.subscriptions.findActive(req.user.id);
  const plans = ['free', 'pro', 'enterprise'];
  const userLevel = plans.indexOf(sub?.planId ?? 'free');
  const requiredLevel = plans.indexOf(requiredPlan);
  if (userLevel < requiredLevel) return res.status(403).json({ error: 'Upgrade required', required: requiredPlan });
  next();
};
module.exports = checkSubscription;
