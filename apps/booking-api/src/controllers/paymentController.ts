import { FastifyReply, FastifyRequest } from "fastify";
import { PaymentService } from "../services/paymentService.js";
import { CreatePaymentRequest } from "../types/payment.js";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  processPayment = async (
    request: FastifyRequest<{ Body: CreatePaymentRequest }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { items, currency = "EUR" } = request.body ?? {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      reply.code(400).send({
        error: "Bad Request",
        message: "items array is required and must not be empty",
      });
      return;
    }

    // Validate each cart item
    for (const item of items) {
      if (!item.eventId || !item.ticketTypeId || !item.quantity || item.quantity <= 0) {
        reply.code(400).send({
          error: "Bad Request",
          message: "Each item must have eventId, ticketTypeId, and a positive quantity",
        });
        return;
      }
    }

    // Amount is resolved server-side in a real implementation.
    // For the mock flow, the frontend passes items and we acknowledge.
    // A sentinel amount of 0 triggers a validation error — use 1 as minimum for mock.
    // In the real Stripe flow, we'd look up prices from the event repository.
    const amount = 1; // placeholder — real implementation will calculate from item prices

    const result = await this.paymentService.processPayment(amount, currency);

    reply.code(200).send({
      message: "Payment processed successfully",
      payment: result,
    });
  };

  refundPayment = async (
    request: FastifyRequest<{ Params: { paymentId: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { paymentId } = request.params;

    if (!paymentId) {
      reply.code(400).send({
        error: "Bad Request",
        message: "paymentId is required",
      });
      return;
    }

    const result = await this.paymentService.refundPayment(paymentId);

    reply.code(200).send({
      message: "Refund processed successfully",
      refund: result,
    });
  };
}
