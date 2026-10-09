import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/server.js";

describe("Payment Routes - POST /payments and POST /payments/:paymentId/refund", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /payments (Public)", () => {
    it("should process payment with valid items array", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        payload: {
          items: [
            {
              eventId: "evt-1",
              ticketTypeId: "tt-1-1",
              quantity: 2,
            },
          ],
          currency: "EUR",
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe("Payment processed successfully");
      expect(body.payment).toBeDefined();
      expect(body.payment.status).toBe("succeeded");
      expect(body.payment.paymentId).toMatch(/^mock_pay_/);
    });

    it("should also work via /api/payments prefix", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/payments",
        payload: {
          items: [
            {
              eventId: "evt-2",
              ticketTypeId: "tt-2-1",
              quantity: 1,
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.payment.paymentId).toMatch(/^mock_pay_/);
    });

    it("should reject payment with missing or empty items", async () => {
      const res1 = await app.inject({
        method: "POST",
        url: "/payments",
        payload: {},
      });
      expect(res1.statusCode).toBe(400);

      const res2 = await app.inject({
        method: "POST",
        url: "/payments",
        payload: { items: [] },
      });
      expect(res2.statusCode).toBe(400);
    });

    it("should reject payment with invalid item properties", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        payload: {
          items: [
            {
              eventId: "evt-1",
              ticketTypeId: "",
              quantity: 0,
            },
          ],
        },
      });
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("positive quantity");
    });
  });

  describe("POST /payments/:paymentId/refund (Public)", () => {
    it("should process refund for valid paymentId", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/mock_pay_12345/refund",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe("Refund processed successfully");
      expect(body.refund).toBeDefined();
      expect(body.refund.status).toBe("succeeded");
      expect(body.refund.paymentId).toBe("mock_pay_12345");
      expect(body.refund.refundId).toMatch(/^mock_ref_/);
    });
  });
});
