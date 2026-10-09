import { PaymentProvider } from "./paymentProvider.js";
import { PaymentResult, RefundResult } from "../types/payment.js";

/**
 * Mock payment provider for development.
 * Simulates deterministic payment and refund success without calling any external service.
 * Intended to be replaced by StripePaymentProvider when real payments are needed.
 */
export class MockPaymentProvider implements PaymentProvider {
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    const paymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return {
      paymentId,
      status: "succeeded",
      amount,
      currency,
      createdAt: new Date().toISOString(),
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
}
