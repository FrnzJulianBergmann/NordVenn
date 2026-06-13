// ExportService.js - User Data Export
const crypto = require('crypto');

class ExportService {
  constructor(db, storage) {
    this.db = db;
    this.storage = storage;
    this.piiFields = ['email', 'phone', 'address', 'ssn', 'dob'];
  }

  async exportUserData(userId, options = {}) {
    const user = await this.db.users.findById(userId);
    const orders = await this.db.orders.findByUser(userId);
    const activity = await this.db.activity.findByUser(userId, { limit: 1000 });

    const exportData = {
      user: this.sanitizePII(user, options.includePII),
      orders: orders.map(o => this.sanitizePII(o, options.includePII)),
      activity,
      exportedAt: new Date().toISOString(),
      requestedBy: userId,
    };

    const filename = this.generateFilename(userId);
    await this.storage.upload(filename, JSON.stringify(exportData));
    await this.db.exportLogs.create({ userId, filename, status: 'completed' });
    return { filename, downloadUrl: await this.storage.getSignedUrl(filename) };
  }

  sanitizePII(obj, include = false) {
    if (include) return obj;
    const sanitized = { ...obj };
    this.piiFields.forEach(field => {
      if (sanitized[field]) sanitized[field] = this.mask(sanitized[field]);
    });
    return sanitized;
  }

  mask(value) {
    return value.toString().replace(/./g, '*').slice(0, -3) + value.toString().slice(-3);
  }

  generateFilename(userId) {
    const hash = crypto.createHash('sha256').update(userId + Date.now()).digest('hex').slice(0, 8);
    return `exports/${userId}/data-${hash}.json`;
  }
}

module.exports = ExportService;
