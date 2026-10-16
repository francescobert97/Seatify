import { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/paymentController.js";
import { PaymentService } from "../services/paymentService.js";
import { MockPaymentProvider } from "../providers/mockPaymentProvider.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseDb } from "../lib/supabaseDb.js";
import { authenticate } from "../auth/authenticate.js";
import { CreatePaymentRequest } from "../types/payment.js";

export interface PaymentRouteOptions {
  paymentController?: PaymentController;
  db?: SupabaseClient;
}

export async function paymentRoutes(
  app: FastifyInstance,
  options: PaymentRouteOptions = {}
): Promise<void> {
  const controller =
    options.paymentController ??
  new PaymentController(
    new PaymentService(new MockPaymentProvider()),
    options.db ?? supabaseDb
  );

    // Authenticated payment session creation
    app.post<{ Body: CreatePaymentRequest }>(
      "/payments",
      {
        preHandler: authenticate,
      },
      controller.processPayment
    );

  // Authenticated payment refund endpoint
  app.post<{
    Params: { paymentId: string };
    Body?: { orderReference?: string };
  }>(
    "/payments/:paymentId/refund",
    {
      preHandler: authenticate,
    },
    controller.refundPayment
  );

  // Payment webhook endpoint (public, verified via signature)
  app.post("/payments/webhook", controller.handleWebhook);
}
