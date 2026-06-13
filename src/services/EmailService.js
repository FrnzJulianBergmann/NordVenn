// EmailService.js - With retry logic
const nodemailer = require('nodemailer');

class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config.smtp);
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 5000;
    this.queue = [];
  }

  async send(to, subject, body, options = {}) {
    const mail = { from: options.from || 'noreply@nordvenn.com', to, subject, html: body };
    return await this.sendWithRetry(mail, 0);
  }

  async sendWithRetry(mail, attempt) {
    try {
      const result = await this.transporter.sendMail(mail);
      await this.logDelivery(mail.to, 'delivered', result.messageId);
      return result;
    } catch (err) {
      if (attempt < this.maxRetries) {
        await this.delay(this.retryDelay * Math.pow(2, attempt));
        return this.sendWithRetry(mail, attempt + 1);
      }
      await this.logDelivery(mail.to, 'failed', null, err.message);
      await this.addToDeadLetterQueue(mail, err);
      throw err;
    }
  }

  async addToDeadLetterQueue(mail, error) {
    this.queue.push({ mail, error: error.message, failedAt: new Date(), retries: this.maxRetries });
  }

  async logDelivery(to, status, messageId, error = null) {
    console.log(JSON.stringify({ to, status, messageId, error, timestamp: new Date() }));
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

module.exports = EmailService;
