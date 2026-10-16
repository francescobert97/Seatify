import { FastifyReply, FastifyRequest } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { PaymentService } from "../services/paymentService.js";
import { CreatePaymentRequest, WebhookEvent } from "../types/payment.js";
import { supabaseDb } from "../lib/supabaseDb.js";
import "../types/auth.js";

export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private db: SupabaseClient = supabaseDb
  ) {}

  processPayment = async (
    request: FastifyRequest<{ Body: CreatePaymentRequest }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { orderReference } = request.body ?? {};

    // orderReference is strictly required; legacy items contract is removed
    if (!orderReference || typeof orderReference !== "string" || orderReference.trim() === "") {
      reply.code(400).send({
        error: "Bad Request",
        message: "orderReference is required",
      });
      return;
    }

    const userId = request.user?.id;
    if (!userId) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication required to initiate payment",
      });
      return;
    }

    // Verify against orders table that the order exists and belongs to the authenticated user
    const { data: order, error } = await this.db
      .from("orders")
      .select("*")
      .eq("order_reference", orderReference)
      .maybeSingle();

    if (error) {
      request.log.error({ error }, "Error querying order for payment");
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
      return;
    }

    if (!order || order.user_id !== userId) {
      reply.code(404).send({
        error: "Not Found",
        message: `Order '${orderReference}' not found`,
      });
      return;
    }

    // Verify that the order is in 'pending' status
    if (order.status !== "pending") {
      reply.code(400).send({
        error: "Bad Request",
        message: `Order '${orderReference}' is not pending payment (current status: ${order.status})`,
      });
      return;
    }

    // Amount and currency are resolved exclusively from trusted database data
    const totalAmount =
      typeof order.total_amount === "string"
        ? parseFloat(order.total_amount)
        : Number(order.total_amount);
    const orderCurrency = order.currency || "EUR";

    // Inject orderReference and userId into payment gateway session metadata
    const metadata: Record<string, string> = {
      orderReference,
      userId,
    };

    const result = await this.paymentService.processPayment(
      totalAmount,
      orderCurrency,
      metadata
    );

    // If payment provider completed the payment immediately (e.g. MockPaymentProvider or direct charge),
    // update order status in database to 'completed'
    if (result.status === "succeeded") {
      const { error: updateError } = await this.db
        .from("orders")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", orderReference);

      if (updateError) {
        request.log.error(
          { error: updateError, orderReference },
          "Failed to update order status to completed after payment"
        );
        reply.code(500).send({
          error: "Internal Server Error",
          message: updateError.message,
        });
        return;
      }
    }

    reply.code(200).send({
      message: "Payment session created successfully",
      payment: result,
    });
  };

  refundPayment = async (
    request: FastifyRequest<{
      Params: { paymentId: string };
      Body?: { orderReference?: string };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { paymentId } = request.params;
    const { orderReference } = request.body ?? {};

    if (!paymentId) {
      reply.code(400).send({
        error: "Bad Request",
        message: "paymentId is required",
      });
      return;
    }

    const userId = request.user?.id;

    // If an orderReference is supplied, enforce ownership and state transition rules
    if (orderReference) {
      const { data: order, error } = await this.db
        .from("orders")
        .select("*")
        .eq("order_reference", orderReference)
        .maybeSingle();

      if (error) {
        request.log.error({ error }, "Error querying order for refund");
        reply.code(500).send({
          error: "Internal Server Error",
          message: error.message,
        });
        return;
      }

      if (!order || order.user_id !== userId) {
        reply.code(404).send({
          error: "Not Found",
          message: `Order '${orderReference}' not found`,
        });
        return;
      }

      // Valid state transition: only 'completed' or 'refund_requested' orders can be refunded
      if (order.status !== "completed" && order.status !== "refund_requested") {
        reply.code(400).send({
          error: "Bad Request",
          message: `Cannot refund order in '${order.status}' status (must be 'completed' or 'refund_requested')`,
        });
        return;
      }

      const refundResult = await this.paymentService.refundPayment(paymentId);

      // Successfully processed refund moves order to 'refunded'
      await this.db
        .from("orders")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", orderReference);

      reply.code(200).send({
        message: "Refund processed successfully",
        refund: refundResult,
        status: "refunded",
      });
      return;
    }

    const result = await this.paymentService.refundPayment(paymentId);

    reply.code(200).send({
      message: "Refund processed successfully",
      refund: result,
    });
  };

  handleWebhook = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const signature =
      (request.headers["stripe-signature"] as string | undefined) ||
      (request.headers["x-webhook-signature"] as string | undefined);
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    let event: WebhookEvent;
    try {
      event = this.paymentService.verifyWebhook(
        request.body as Record<string, unknown>,
        signature,
        webhookSecret
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Webhook signature verification failed";
      request.log.warn({ err }, "Webhook signature verification error");
      reply.code(400).send({
        error: "Bad Request",
        message,
      });
      return;
    }

    const successEvents = [
      "checkout.session.completed",
      "payment_intent.succeeded",
    ];

    const refundEvents = [
      "charge.refunded",
      "payment_intent.refunded",
    ];

    if (!successEvents.includes(event.type) && !refundEvents.includes(event.type)) {
      reply.code(200).send({
        received: true,
        ignored: true,
        message: `Event '${event.type}' is not a payment completion or refund event; ignored`,
      });
      return;
    }

    const metadata = event.data?.object?.metadata;
    const orderReference = metadata?.orderReference;
    const userId = metadata?.userId;

    if (!orderReference || !userId) {
      reply.code(400).send({
        error: "Bad Request",
        message: "Missing orderReference or userId in webhook session metadata",
      });
      return;
    }

    const { data: order, error: fetchError } = await this.db
      .from("orders")
      .select("*")
      .eq("order_reference", orderReference)
      .maybeSingle();

    if (fetchError) {
      request.log.error({ fetchError }, "Database error fetching order in webhook");
      reply.code(500).send({
        error: "Internal Server Error",
        message: fetchError.message,
      });
      return;
    }

    if (!order) {
      reply.code(404).send({
        error: "Not Found",
        message: `Order '${orderReference}' not found`,
      });
      return;
    }

    if (order.user_id !== userId) {
      reply.code(400).send({
        error: "Bad Request",
        message: "Webhook userId does not match order user_id",
      });
      return;
    }

    // Handle payment success event
    if (successEvents.includes(event.type)) {
      if (order.status === "completed") {
        reply.code(200).send({
          received: true,
          idempotent: true,
          status: "completed",
          orderReference,
          message: "Order already completed",
        });
        return;
      }

      if (order.status !== "pending") {
        reply.code(400).send({
          error: "Bad Request",
          message: `Cannot complete order in '${order.status}' status`,
        });
        return;
      }

      const { error: updateError } = await this.db
        .from("orders")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", orderReference);

      if (updateError) {
        request.log.error(
          { updateError },
          "Database error updating order status in webhook"
        );
        reply.code(500).send({
          error: "Internal Server Error",
          message: updateError.message,
        });
        return;
      }

      reply.code(200).send({
        received: true,
        status: "completed",
        orderReference,
      });
      return;
    }

    // Handle refund event
    if (refundEvents.includes(event.type)) {
      if (order.status === "refunded") {
        reply.code(200).send({
          received: true,
          idempotent: true,
          status: "refunded",
          orderReference,
          message: "Order already refunded",
        });
        return;
      }

      if (order.status !== "completed" && order.status !== "refund_requested") {
        reply.code(400).send({
          error: "Bad Request",
          message: `Cannot refund order in '${order.status}' status`,
        });
        return;
      }

      const { error: updateError } = await this.db
        .from("orders")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("order_reference", orderReference);

      if (updateError) {
        reply.code(500).send({
          error: "Internal Server Error",
          message: updateError.message,
        });
        return;
      }

      reply.code(200).send({
        received: true,
        status: "refunded",
        orderReference,
      });
      return;
    }
  };
}
