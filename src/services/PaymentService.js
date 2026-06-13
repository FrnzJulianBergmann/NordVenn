// PaymentService.js - Refactored
class PaymentService {
  constructor(config) {
    this.gateway = config.gateway;
    this.retryLimit = config.retryLimit || 3;
    this.webhookUrl = config.webhookUrl;
  }

  async processPayment(order) {
    const validated = this.validateOrder(order);
    if (!validated.success) throw new Error(validated.error);
    return await this.gateway.charge(order.amount, order.currency, order.customerId);
  }

  validateOrder(order) {
    if (!order.amount || order.amount <= 0) return { success: false, error: 'Invalid amount' };
    if (!order.customerId) return { success: false, error: 'Missing customer ID' };
    return { success: true };
  }

  async handleWebhook(payload) {
    const event = this.parseWebhookPayload(payload);
    if (event.type === 'payment.succeeded') await this.onSuccess(event);
    if (event.type === 'payment.failed') await this.onFailure(event);
  }
}

module.exports = PaymentService;
