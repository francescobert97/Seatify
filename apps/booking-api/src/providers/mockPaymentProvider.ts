import { PaymentProvider } from "./paymentProvider.js";
import { PaymentResult, RefundResult, WebhookEvent } from "../types/payment.js";

/**
 * Mock payment provider for development and testing.
 * Simulates deterministic payment and refund success without calling any external service.
 * Supports metadata forwarding (e.g. orderReference, userId) to mirror Stripe session behavior.
 */
export class MockPaymentProvider implements PaymentProvider {
  async processPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<PaymentResult> {
    const paymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      paymentId,
      status: "succeeded",
      amount,
      currency,
      createdAt: new Date().toISOString(),
      ...(metadata ? { metadata } : {}),
    };
  }

  async refundPayment(paymentId: string): Promise<RefundResult> {
    const refundId = `mock_ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      refundId,
      paymentId,
      status: "succeeded",
      refundedAt: new Date().toISOString(),
    };
  }

  verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signature: string | undefined,
    secret?: string
  ): WebhookEvent {
    const configuredSecret = secret ?? process.env.PAYMENT_WEBHOOK_SECRET;

    if (configuredSecret) {
      if (!signature) {
        throw new Error("Missing webhook signature");
      }
      if (
        signature !== configuredSecret &&
        signature !== `sig_${configuredSecret}` &&
        signature !== `t=123,v1=${configuredSecret}`
      ) {
        throw new Error("Invalid webhook signature");
      }
    }

    const event =
      typeof payload === "string" ? JSON.parse(payload) : payload;

    if (!event || typeof event !== "object" || !event.type) {
      throw new Error("Invalid webhook event payload");
    }

    return event as WebhookEvent;
  }
}

