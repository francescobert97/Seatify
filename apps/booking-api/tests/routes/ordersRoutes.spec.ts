import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { setupMockJwks, MockJwksHelper } from "../helpers/mockJwks.js";
import { createMockSupabaseDb } from "../helpers/mockSupabaseDb.js";
import { ordersRoutes } from "../../src/routes/ordersRoutes.js";
import { OrderDbRow } from "../../src/types/order.js";
import { EventsService } from "../../src/services/eventsService.js";
import { MockEventRepository } from "../../src/repositories/mockEventRepository.js";

describe("Orders Routes - GET & POST /api/orders and /api/orders/:orderReference", () => {
  let app: FastifyInstance;
  let jwksHelper: MockJwksHelper;
  let mockDb: ReturnType<typeof createMockSupabaseDb>;

  const userA = "user-uuid-111";
  const userB = "user-uuid-222";
  let tokenUserA: string;
  let tokenUserB: string;

  const sampleOrders: OrderDbRow[] = [
    {
      id: "ord-uuid-1",
      user_id: userA,
      order_reference: "ORD-2026-AAA111",
      purchase_date: "2026-10-10T14:30:00.000Z",
      status: "completed",
      event_id: "evt-1",
      event_name: "Taylor Swift | The Eras Tour",
      event_date: "2027-06-15T20:00:00.000Z",
      venue: "Wembley Stadium",
      city: "London, UK",
      image_url: "https://example.com/taylor.jpg",
      tickets: [
        {
          id: "tkt-1",
          ticketTypeId: "tt-1-1",
          name: "General Admission Standing",
          price: 85,
        },
      ],
      total_amount: 85,
      currency: "EUR",
      created_at: "2026-10-10T14:30:00.000Z",
      updated_at: "2026-10-10T14:30:00.000Z",
    },
    {
      id: "ord-uuid-2",
      user_id: userA,
      order_reference: "ORD-2026-AAA222",
      purchase_date: "2026-09-01T10:00:00.000Z",
      status: "pending",
      event_id: "evt-2",
      event_name: "UEFA Champions League Final",
      event_date: "2027-01-20T19:30:00.000Z",
      venue: "Allianz Arena",
      city: "Munich, Germany",
      image_url: null,
      tickets: [
        {
          id: "tkt-2",
          ticketTypeId: "tt-2-1",
          name: "Category 3 Upper Tier",
          price: 120,
        },
      ],
      total_amount: 120,
      currency: "EUR",
      created_at: "2026-09-01T10:00:00.000Z",
      updated_at: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "ord-uuid-3",
      user_id: userB,
      order_reference: "ORD-2026-BBB999",
      purchase_date: "2026-10-12T16:00:00.000Z",
      status: "completed",
      event_id: "evt-1",
      event_name: "Taylor Swift | The Eras Tour",
      event_date: "2027-04-10T18:00:00.000Z",
      venue: "Wembley Stadium",
      city: "London, UK",
      image_url: null,
      tickets: [
        {
          id: "tkt-3",
          ticketTypeId: "tt-1-1",
          name: "General Admission Standing",
          price: 85,
        },
      ],
      total_amount: 85,
      currency: "EUR",
      created_at: "2026-10-12T16:00:00.000Z",
      updated_at: "2026-10-12T16:00:00.000Z",
    },
    {
      id: "ord-uuid-4",
      user_id: userA,
      order_reference: "ORD-2026-AAA333",
      purchase_date: "2026-10-13T10:00:00.000Z",
      status: "canceled",
      event_id: "evt-3",
      event_name: "Primavera Sound",
      event_date: "2027-07-01T18:00:00.000Z",
      venue: "Parc del Fòrum",
      city: "Barcelona",
      image_url: null,
      tickets: [],
      total_amount: 150,
      currency: "EUR",
      created_at: "2026-10-13T10:00:00.000Z",
      updated_at: "2026-10-13T10:00:00.000Z",
    },
    {
      id: "ord-uuid-5",
      user_id: userA,
      order_reference: "ORD-2026-AAA444",
      purchase_date: "2026-10-14T10:00:00.000Z",
      status: "refund_requested",
      event_id: "evt-4",
      event_name: "Tomorrowland",
      event_date: "2027-07-20T18:00:00.000Z",
      venue: "De Schorre",
      city: "Boom",
      image_url: null,
      tickets: [],
      total_amount: 200,
      currency: "EUR",
      created_at: "2026-10-14T10:00:00.000Z",
      updated_at: "2026-10-14T10:00:00.000Z",
    },
    {
      id: "ord-uuid-6",
      user_id: userA,
      order_reference: "ORD-2026-AAA555",
      purchase_date: "2026-10-14T11:00:00.000Z",
      status: "refunded",
      event_id: "evt-5",
      event_name: "Glastonbury",
      event_date: "2027-06-25T18:00:00.000Z",
      venue: "Worthy Farm",
      city: "Pilton",
      image_url: null,
      tickets: [],
      total_amount: 300,
      currency: "EUR",
      created_at: "2026-10-14T11:00:00.000Z",
      updated_at: "2026-10-14T11:00:00.000Z",
    },
  ];

  beforeAll(async () => {
    jwksHelper = await setupMockJwks("https://test-orders.supabase.co");
    process.env.SUPABASE_URL = jwksHelper.url;

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
  });

  beforeEach(async () => {
    mockDb = createMockSupabaseDb(sampleOrders);

    app = Fastify({ logger: false });
    await app.register(ordersRoutes, {
      db: mockDb as any,
      eventsService: new EventsService(new MockEventRepository()),
    });
    await app.ready();
  });

  describe("GET /api/orders (Protected)", () => {
    it("should return 401 when no token is provided", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders",
      });
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when invalid token is provided", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { authorization: "Bearer invalid.token.signature" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("should return user-scoped orders sorted by event_date ascending", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(200);
      const orders = JSON.parse(res.payload);
      expect(Array.isArray(orders)).toBe(true);
      expect(orders).toHaveLength(5); // ord-1, ord-2, ord-4, ord-5, ord-6

      // Verify sorting by eventDate ascending
      expect(orders[0].orderReference).toBe("ORD-2026-AAA222"); // 2027-01-20
      expect(orders[0].eventName).toBe("UEFA Champions League Final");
      expect(orders[1].orderReference).toBe("ORD-2026-AAA111"); // 2027-06-15
      expect(orders[1].eventName).toBe("Taylor Swift | The Eras Tour");

      // Verify camelCase mapping
      expect(orders[0].userId).toBe(userA);
      expect(orders[0].totalAmount).toBe(120);
      expect(orders[0].purchaseDate).toBe("2026-09-01T10:00:00.000Z");
      expect(orders[0].tickets).toHaveLength(1);
    });

    it("should return empty array if user has no orders", async () => {
      const tokenEmptyUser = await jwksHelper.createToken(
        { email: "empty@seatify.io", role: "authenticated" },
        { subject: "user-with-no-orders" }
      );

      const res = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenEmptyUser}` },
      });

      expect(res.statusCode).toBe(200);
      const orders = JSON.parse(res.payload);
      expect(orders).toEqual([]);
    });

    it("should return 500 when Supabase query fails and not silently return empty array", async () => {
      mockDb.setForcedError({ message: "Supabase connection error" });

      const res = await app.inject({
        method: "GET",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe("Internal Server Error");
      expect(body.message).toContain("Supabase connection error");
    });
  });

  describe("GET /api/orders/:orderReference (Protected)", () => {
    it("should return 401 when no token is provided", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders/ORD-2026-AAA111",
      });
      expect(res.statusCode).toBe(401);
    });

    it("should return 200 and mapped order when found and owned by requester", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders/ORD-2026-AAA111",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(200);
      const order = JSON.parse(res.payload);
      expect(order.orderReference).toBe("ORD-2026-AAA111");
      expect(order.userId).toBe(userA);
      expect(order.eventName).toBe("Taylor Swift | The Eras Tour");
      expect(order.venue).toBe("Wembley Stadium");
      expect(order.city).toBe("London, UK");
      expect(order.status).toBe("completed");
      expect(order.totalAmount).toBe(85);
      expect(order.tickets).toEqual([
        {
          id: "tkt-1",
          ticketTypeId: "tt-1-1",
          name: "General Admission Standing",
          price: 85,
        },
      ]);
    });

    it("should return 404 when order reference does not exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/orders/ORD-NONEXISTENT",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("not found");
    });

    it("should return 404 when order belongs to a different user (unauthorized order reference isolation)", async () => {
      // User B attempts to access User A's order
      const res = await app.inject({
        method: "GET",
        url: "/api/orders/ORD-2026-AAA111",
        headers: { authorization: `Bearer ${tokenUserB}` },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("not found");
    });

    it("should return 500 when Supabase query fails on single order lookup", async () => {
      mockDb.setForcedError({ message: "Database timeout" });

      const res = await app.inject({
        method: "GET",
        url: "/api/orders/ORD-2026-AAA111",
        headers: { authorization: `Bearer ${tokenUserA}` },
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("Database timeout");
    });
  });

  describe("POST /api/orders (Protected)", () => {
    it("should return 401 when unauthenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 1 }],
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it("should return 400 when eventId is missing or empty", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 1 }],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("eventId is required");
    });

    it("should return 400 when tickets array is missing or empty", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("tickets must be a non-empty array");
    });

    it("should return 404 when eventId does not exist in backend repository", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-non-existent",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 1 }],
        },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("not found");
    });

    it("should return 400 when ticketTypeId does not exist for the event", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-invalid-id", quantity: 1 }],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("does not exist for event");
    });

    it("should return 400 when ticket quantity is invalid (non-positive or non-integer)", async () => {
      const res1 = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 0 }],
        },
      });
      expect(res1.statusCode).toBe(400);

      const res2 = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 1.5 }],
        },
      });
      expect(res2.statusCode).toBe(400);
    });

    it("should return 400 when requested quantity exceeds available tickets", async () => {
      // In mockEvents, tt-1-3 has available: 10
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-1-3", quantity: 999 }],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("exceeds available tickets");
    });

    it("should create order with server-calculated price and total, pending status, and unique reference", async () => {
      // Event: evt-1, tt-1-1 is €85, tt-1-2 is €135.
      // Request: 2 x tt-1-1 (€170) + 1 x tt-1-2 (€135) = €305 total.
      // Attempt to tamper with client-supplied total or price:
      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [
            { ticketTypeId: "tt-1-1", quantity: 2, price: 1 }, // tampered client price ignored
            { ticketTypeId: "tt-1-2", quantity: 1 },
          ],
          totalAmount: 1, // tampered client total ignored
          userId: "malicious-user-id", // tampered client user_id ignored
        },
      });

      expect(res.statusCode).toBe(201);
      const order = JSON.parse(res.payload);

      expect(order.id).toBeDefined();
      expect(order.userId).toBe(userA); // Derived strictly from request.user.id
      expect(order.orderReference).toMatch(/^ORD-2026-[A-Z0-9]+$/);
      expect(order.status).toBe("pending");
      expect(order.eventId).toBe("evt-1");
      expect(order.eventName).toBe("Taylor Swift | The Eras Tour");
      expect(order.venue).toBe("Wembley Stadium");
      expect(order.city).toBe("London, UK");

      // Verify individual tickets are created (2 + 1 = 3 individual tickets)
      expect(order.tickets).toHaveLength(3);
      expect(order.tickets[0].price).toBe(85);
      expect(order.tickets[1].price).toBe(85);
      expect(order.tickets[2].price).toBe(135);

      // Verify server-side calculated total: 85 + 85 + 135 = 305
      expect(order.totalAmount).toBe(305);
      expect(order.currency).toBe("EUR");

      // Verify persisted in Supabase
      const stored = mockDb.orders.find((o) => o.order_reference === order.orderReference);
      expect(stored).toBeDefined();
      expect(stored?.user_id).toBe(userA);
      expect(stored?.status).toBe("pending");
      expect(stored?.total_amount).toBe(305);
    });

    it("should return 500 when Supabase insert fails", async () => {
      mockDb.setForcedError({ message: "Database insert error" });

      const res = await app.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${tokenUserA}` },
        payload: {
          eventId: "evt-1",
          tickets: [{ ticketTypeId: "tt-1-1", quantity: 1 }],
        },
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.payload);
      expect(body.message).toContain("Database insert error");
    });
  });
});
