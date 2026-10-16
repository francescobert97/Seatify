// The payload sent to POST /api/payments
export interface CreatePaymentRequest {
  orderReference: string;
}

// Result returned by PaymentProvider.processPayment()
export interface PaymentResult {
  paymentId: string;
  status: "succeeded" | "failed" | "pending";
  amount: number;
  currency: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

// Result returned by PaymentProvider.refundPayment()
export interface RefundResult {
  refundId: string;
  paymentId: string;
  status: "succeeded" | "failed";
  refundedAt: string;
}

// Webhook event structure (standard payment provider event model)
export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      metadata?: Record<string, string>;
      [key: string]: unknown;
    };
  };
}

