// EmailWorker.js
class EmailWorker {
  constructor(emailService, db) {
    this.emailService = emailService;
    this.db = db;
    this.running = false;
  }

  start(intervalMs = 60000) {
    this.running = true;
    this.interval = setInterval(() => this.processQueue(), intervalMs);
    console.log('EmailWorker started');
  }

  stop() {
    this.running = false;
    clearInterval(this.interval);
  }

  async processQueue() {
    const failed = await this.db.emailLogs.findAll({ where: { status: 'failed' }, limit: 50 });
    for (const log of failed) {
      try {
        await this.emailService.send(log.to, log.subject, log.body);
        await log.update({ status: 'delivered', retriedAt: new Date() });
      } catch (err) {
        await log.increment('retryCount');
        if (log.retryCount >= 5) await log.update({ status: 'dead' });
      }
    }
  }
}

module.exports = EmailWorker;
