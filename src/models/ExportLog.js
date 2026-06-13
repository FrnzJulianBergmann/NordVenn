// ExportLog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('ExportLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.STRING, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending','completed','failed'), defaultValue: 'pending' },
  requestedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
