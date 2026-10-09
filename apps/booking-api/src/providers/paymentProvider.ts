import { PaymentResult, RefundResult } from "../types/payment.js";

/**
 * Abstraction over any payment provider (Mock, Stripe, etc.).
 * PaymentService depends on this interface — never on a concrete implementation.
 */
export interface PaymentProvider {
  /**
   * Process a payment for a given amount and currency.
   * Returns a PaymentResult with the provider-assigned payment ID and status.
   */
  processPayment(amount: number, currency: string): Promise<PaymentResult>;

  /**
   * Refund a previously processed payment identified by paymentId.
   * Returns a RefundResult describing the outcome.
   */
  refundPayment(paymentId: string): Promise<RefundResult>;
}
