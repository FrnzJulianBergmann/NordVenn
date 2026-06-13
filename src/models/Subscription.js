const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  planId: { type: DataTypes.ENUM('free','pro','enterprise'), defaultValue: 'free' },
  status: { type: DataTypes.ENUM('active','cancelled','past_due','trialing'), defaultValue: 'active' },
  stripeSubId: { type: DataTypes.STRING },
  stripeCustomerId: { type: DataTypes.STRING },
  currentPeriodStart: { type: DataTypes.DATE },
  currentPeriodEnd: { type: DataTypes.DATE },
  cancelAtPeriodEnd: { type: DataTypes.BOOLEAN, defaultValue: false },
  trialEnd: { type: DataTypes.DATE },
});
