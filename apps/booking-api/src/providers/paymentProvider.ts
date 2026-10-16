import { PaymentResult, RefundResult, WebhookEvent } from "../types/payment.js";

/**
 * Abstraction over any payment provider (Mock, Stripe, etc.).
 * PaymentService depends on this interface — never on a concrete implementation.
 */
export interface PaymentProvider {
  /**
   * Process a payment for a given amount and currency, with optional gateway session metadata.
   * Returns a PaymentResult with the provider-assigned payment ID, status, and metadata.
   */
  processPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<PaymentResult>;

  /**
   * Refund a previously processed payment identified by paymentId.
   * Returns a RefundResult describing the outcome.
   */
  refundPayment(paymentId: string): Promise<RefundResult>;

  /**
   * Verifies the authenticity of an incoming webhook event using the provider's signature mechanism.
   * Throws an error if the signature is invalid or missing when a secret is configured.
   */
  verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signature: string | undefined,
    secret?: string
  ): WebhookEvent;
}

