// Cart item sent from the frontend during checkout
export interface CheckoutCartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

// The payload the frontend POSTs to POST /api/payments
export interface CreatePaymentRequest {
  items: CheckoutCartItem[];
  currency?: string;
}

// Result returned by PaymentProvider.processPayment()
export interface PaymentResult {
  paymentId: string;
  status: "succeeded" | "failed" | "pending";
  amount: number;
  currency: string;
  createdAt: string;
}

// Result returned by PaymentProvider.refundPayment()
export interface RefundResult {
  refundId: string;
  paymentId: string;
  status: "succeeded" | "failed";
  refundedAt: string;
}
