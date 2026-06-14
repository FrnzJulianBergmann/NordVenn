const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('AnalyticsEvent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  repoId: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('pr_opened','pr_merged','commit_pushed','deployment','incident_created','incident_resolved'), allowNull: false },
  payload: { type: DataTypes.JSONB },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
