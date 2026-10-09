import { PaymentProvider } from "../providers/paymentProvider.js";
import { PaymentResult, RefundResult } from "../types/payment.js";

/**
 * PaymentService contains the business logic for Seatify payments.
 * It depends on the PaymentProvider abstraction, not on any concrete provider.
 * Swap the provider (Mock → Stripe) in the composition root without touching this class.
 */
export class PaymentService {
  constructor(private readonly provider: PaymentProvider) {}

  /**
   * Process a payment for the given total amount and currency.
   * Delegates the actual charge to the injected PaymentProvider.
   */
  async processPayment(amount: number, currency: string = "EUR"): Promise<PaymentResult> {
    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }
    return this.provider.processPayment(amount, currency);
  }

  /**
   * Refund a previously processed payment.
   * Delegates to the injected PaymentProvider.
   */
  async refundPayment(paymentId: string): Promise<RefundResult> {
    if (!paymentId || typeof paymentId !== "string" || paymentId.trim() === "") {
      throw new Error("A valid paymentId is required to issue a refund");
    }
    return this.provider.refundPayment(paymentId);
  }
}
