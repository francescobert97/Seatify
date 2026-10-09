import { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/paymentController.js";
import { PaymentService } from "../services/paymentService.js";
import { MockPaymentProvider } from "../providers/mockPaymentProvider.js";

export interface PaymentRouteOptions {
  paymentController?: PaymentController;
}

export async function paymentRoutes(
  app: FastifyInstance,
  options: PaymentRouteOptions = {}
): Promise<void> {
  const controller =
    options.paymentController ??
    new PaymentController(new PaymentService(new MockPaymentProvider()));

  // Public payment endpoints — no authentication required for mock flow.
  // When Stripe is integrated, auth can be added here without changing PaymentService.
  app.post("/payments", controller.processPayment);
  app.post<{ Params: { paymentId: string } }>(
    "/payments/:paymentId/refund",
    controller.refundPayment
  );
}
