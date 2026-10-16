import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { setupMockJwks, MockJwksHelper } from "../helpers/mockJwks.js";
import { createMockSupabaseDb } from "../helpers/mockSupabaseDb.js";
import { paymentRoutes } from "../../src/routes/paymentRoutes.js";
import { OrderDbRow } from "../../src/types/order.js";

describe("Payment Routes - Order-Based Sessions, Refunds & Secure Webhook", () => {
  let app: FastifyInstance;
  let jwksHelper: MockJwksHelper;
  let mockDb: ReturnType<typeof createMockSupabaseDb>;

  const userA = "user-pay-123";
  const userB = "user-other-456";
  let tokenUserA: string;
  let tokenUserB: string;

  const sampleOrders: OrderDbRow[] = [
    {
      id: "ord-p1",
      user_id: userA,
      order_reference: "ORD-2026-PENDING1",
      purchase_date: "2026-10-15T12:00:00.000Z",
      status: "pending",
      event_id: "evt-1",
      event_name: "Taylor Swift | The Eras Tour",
      event_date: "2027-08-10T19:00:00.000Z",
      venue: "Wembley Stadium",
      city: "London",
      image_url: null,
      tickets: [
        {
          id: "tkt-1",
          ticketTypeId: "tt-1",
          name: "General Admission",
          price: 85,
        },
      ],
      total_amount: 85,
      currency: "EUR",
      created_at: "2026-10-15T12:00:00.000Z",
      updated_at: "2026-10-15T12:00:00.000Z",
    },
    {
      id: "ord-p2",
      user_id: userA,
      order_reference: "ORD-2026-COMPLETED1",
      purchase_date: "2026-10-10T12:00:00.000Z",
      status: "completed",
      event_id: "evt-2",
      event_name: "Champions League Final",
      event_date: "2027-06-15T20:00:00.000Z",
      venue: "Allianz Arena",
      city: "Munich",
      image_url: null,
      tickets: [
        {
          id: "tkt-2",
          ticketTypeId: "tt-2",
          name: "Category 1",
          price: 250,
        },
      ],
      total_amount: 250,
      currency: "EUR",
      created_at: "2026-10-10T12:00:00.000Z",
      updated_at: "2026-10-10T12:00:00.000Z",
    },
    {
      id: "ord-p3",
      user_id: userB,
      order_reference: "ORD-2026-OTHERUSER1",
      purchase_date: "2026-10-15T12:00:00.000Z",
      status: "pending",
      event_id: "evt-3",
      event_name: "Rock Festival",
      event_date: "2027-09-01T20:00:00.000Z",
      venue: "Hippodrome",
      city: "Paris",
      image_url: null,
      tickets: [
        {
          id: "tkt-3",
          ticketTypeId: "tt-3",
          name: "Weekend Pass",
          price: 180,
        },
      ],
      total_amount: 180,
      currency: "EUR",
      created_at: "2026-10-15T12:00:00.000Z",
      updated_at: "2026-10-15T12:00:00.000Z",
    },
    {
      id: "ord-p4",
      user_id: userA,
      order_reference: "ORD-2026-REFUNDREQ1",
      purchase_date: "2026-10-12T12:00:00.000Z",
      status: "refund_requested",
      event_id: "evt-4",
      event_name: "Primavera Sound",
      event_date: "2027-06-01T18:00:00.000Z",
      venue: "Parc del Forum",
      city: "Barcelona",
      image_url: null,
      tickets: [],
      total_amount: 100,
      currency: "EUR",
      created_at: "2026-10-12T12:00:00.000Z",
      updated_at: "2026-10-12T12:00:00.000Z",
    },
    {
      id: "ord-p5",
      user_id: userA,
      order_reference: "ORD-2026-REFUNDED1",
      purchase_date: "2026-10-11T12:00:00.000Z",
      status: "refunded",
      event_id: "evt-5",
      event_name: "Jazz Festival",
      event_date: "2027-05-01T18:00:00.000Z",
      venue: "Blue Note",
      city: "Milan",
      image_url: null,
      tickets: [],
      total_amount: 60,
      currency: "EUR",
      created_at: "2026-10-11T12:00:00.000Z",
      updated_at: "2026-10-11T12:00:00.000Z",
    },
    {
      id: "ord-p6",
      user_id: userA,
      order_reference: "ORD-2026-CANCELED1",
      purchase_date: "2026-10-11T13:00:00.000Z",
      status: "canceled",
      event_id: "evt-6",
      event_name: "Opera Gala",
      event_date: "2027-05-15T19:00:00.000Z",
      venue: "La Scala",
      city: "Milan",
      image_url: null,
      tickets: [],
      total_amount: 110,
      currency: "EUR",
      created_at: "2026-10-11T13:00:00.000Z",
      updated_at: "2026-10-11T13:00:00.000Z",
    },
  ];

  beforeAll(async () => {
    jwksHelper = await setupMockJwks("https://test-payments.supabase.co");
    process.env.SUPABASE_URL = jwksHelper.url;
    process.env.PAYMENT_WEBHOOK_SECRET = "whsec_test_secret_123";

    tokenUserA = await jwksHelper.createToken(
      { email: "userA@seatify.io", role: "authenticated" },
      { subject: userA }
    );
    tokenUserB = await jwksHelper.createToken(
      { email: "userB@seatify.io", role: "authenticated" },
      { subject: userB }
    );
  });

  afterAll(async () => {
    jwksHelper.restore();
    delete process.env.SUPABASE_URL;
    delete process.env.PAYMENT_WEBHOOK_SECRET;
  });

  beforeEach(async () => {
    mockDb = createMockSupabaseDb(sampleOrders);

    app = Fastify({ logger: false });
    await app.register(paymentRoutes, { db: mockDb as any });
    await app.ready();
  });

  describe("POST /payments (Payment Session Creation)", () => {
    it("should return 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        payload: { orderReference: "ORD-2026-PENDING1" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("should return 400 when orderReference is missing or empty", async () => {
      const res1 = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {},
      });
      expect(res1.statusCode).toBe(400);
      expect(JSON.parse(res1.payload).message).toContain("orderReference is required");

      const res2 = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "   " },
      });
      expect(res2.statusCode).toBe(400);
    });

    it("should return 404 when order does not exist", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-DOES-NOT-EXIST" },
      });
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).message).toContain("not found");
    });

    it("should return 404 when order belongs to another user (isolation)", async () => {
      // User A attempts to pay for User B's order
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-OTHERUSER1" },
      });
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).message).toContain("not found");
    });

    it("should return 400 when order is not in pending status", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-COMPLETED1" },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("not pending payment");
    });

    it("should create payment session with amount and currency from stored order and inject provider metadata", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-PENDING1" },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe("Payment session created successfully");
      expect(body.payment).toBeDefined();
      expect(body.payment.status).toBe("succeeded");
      // Amount is taken directly from stored order total_amount (85)
      expect(body.payment.amount).toBe(85);
      expect(body.payment.currency).toBe("EUR");
      // Correct provider metadata injected
      expect(body.payment.metadata).toEqual({
        orderReference: "ORD-2026-PENDING1",
        userId: userA,
      });

      // Synchronous mock payment updates order status directly to completed
      const updatedOrder = mockDb.orders.find((o) => o.order_reference === "ORD-2026-PENDING1");
      expect(updatedOrder?.status).toBe("completed");
    });

    it("should return 500 when Supabase query fails during session creation", async () => {
      mockDb.setForcedError({ message: "Supabase connection error" });

      const res = await app.inject({
        method: "POST",
        url: "/payments",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-PENDING1" },
      });

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.payload).message).toContain("Supabase connection error");
    });
  });

  describe("POST /payments/webhook", () => {
    it("should return 400 when webhook signature is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("Missing webhook signature");
    });

    it("should return 400 when webhook signature is invalid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "invalid_signature" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("Invalid webhook signature");
    });

    it("should return 400 when orderReference or userId is missing from metadata", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1" } } }, // missing userId
        },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("Missing orderReference or userId");
    });

    it("should return 404 when referenced order in webhook does not exist", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-UNKNOWN", userId: userA } } },
        },
      });
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).message).toContain("not found");
    });

    it("should return 400 when webhook userId does not match order user_id", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: "wrong-user" } } },
        },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("does not match");
    });

    it("should ignore irrelevant or non-success events without completing the order", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "payment_intent.payment_failed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.ignored).toBe(true);

      const order = mockDb.orders.find((o) => o.order_reference === "ORD-2026-PENDING1");
      expect(order?.status).toBe("pending");
    });

    it("should successfully complete order on checkout.session.completed", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe("completed");
      expect(body.orderReference).toBe("ORD-2026-PENDING1");

      const order = mockDb.orders.find((o) => o.order_reference === "ORD-2026-PENDING1");
      expect(order?.status).toBe("completed");
      expect(order?.updated_at).toBeDefined();
    });

    it("should handle duplicate webhook delivery idempotently without error", async () => {
      // First webhook delivery
      await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });

      // Duplicate webhook delivery
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.idempotent).toBe(true);
      expect(body.status).toBe("completed");
    });

    it("should update order status to refunded on charge.refunded event", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "charge.refunded",
          data: { object: { metadata: { orderReference: "ORD-2026-COMPLETED1", userId: userA } } },
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe("refunded");

      const order = mockDb.orders.find((o) => o.order_reference === "ORD-2026-COMPLETED1");
      expect(order?.status).toBe("refunded");
    });

    it("should return 500 when Supabase update fails during webhook processing", async () => {
      // Reset order to pending
      const order = mockDb.orders.find((o) => o.order_reference === "ORD-2026-PENDING1")!;
      order.status = "pending";

      mockDb.setForcedError({ message: "Database write error" });

      const res = await app.inject({
        method: "POST",
        url: "/payments/webhook",
        headers: { "stripe-signature": "whsec_test_secret_123" },
        payload: {
          type: "checkout.session.completed",
          data: { object: { metadata: { orderReference: "ORD-2026-PENDING1", userId: userA } } },
        },
      });

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.payload).message).toContain("Database write error");
    });
  });

  describe("POST /payments/:paymentId/refund", () => {
    it("should process refund for valid paymentId", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/mock_pay_12345/refund",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe("Refund processed successfully");
      expect(body.refund).toBeDefined();
      expect(body.refund.status).toBe("succeeded");
      expect(body.refund.paymentId).toBe("mock_pay_12345");
      expect(body.refund.refundId).toMatch(/^mock_ref_/);
    });

    it("should transition order to refunded when orderReference is provided for completed order", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/mock_pay_12345/refund",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-REFUNDREQ1" },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe("refunded");

      const order = mockDb.orders.find((o) => o.order_reference === "ORD-2026-REFUNDREQ1");
      expect(order?.status).toBe("refunded");
    });

    it("should reject refund transition if order is not completed or refund_requested", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/payments/mock_pay_12345/refund",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: { orderReference: "ORD-2026-CANCELED1" },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).message).toContain("Cannot refund order in 'canceled' status");
    });
  });
});
