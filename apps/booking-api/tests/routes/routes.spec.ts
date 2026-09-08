import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/server.js";
import { setupMockJwks, MockJwksHelper } from "../helpers/mockJwks.js";

describe("Booking API - Route Integration Tests", () => {
  let app: FastifyInstance;
  let jwksHelper: MockJwksHelper;

  beforeAll(async () => {
    jwksHelper = await setupMockJwks("https://test-routes.supabase.co");
    process.env.SUPABASE_URL = jwksHelper.url;

    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    jwksHelper.restore();
    delete process.env.SUPABASE_URL;
  });

  describe("GET /api/health (Public)", () => {
    it("should return 200 with ok status without any auth header", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body).toEqual({
        status: "ok",
        message: "Booking API (Fastify) Attiva",
      });
    });
  });

  describe("GET /api/me (Protected)", () => {
    it("should reject request without token with 401", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/me",
      });

      expect(res.statusCode).toBe(401);
    });

    it("should return 200 and authenticated user profile with valid JWT", async () => {
      const token = await jwksHelper.createToken(
        {
          email: "attendee@seatify.io",
          role: "authenticated",
          user_metadata: { firstName: "Jane", lastName: "Doe" },
        },
        { subject: "user-jane-doe-uuid" }
      );

      const res = await app.inject({
        method: "GET",
        url: "/api/me",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.user).toBeDefined();
      expect(body.user.id).toBe("user-jane-doe-uuid");
      expect(body.user.email).toBe("attendee@seatify.io");
      expect(body.user.user_metadata).toEqual({ firstName: "Jane", lastName: "Doe" });
    });
  });

  describe("POST /api/bookings (Protected)", () => {
    it("should reject unauthenticated booking creation with 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/bookings",
        payload: {
          eventId: "event-123",
          tickets: 2,
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it("should return 400 if eventId or tickets is missing", async () => {
      const token = await jwksHelper.createToken(
        { email: "user@seatify.io", role: "authenticated" },
        { subject: "user-valid-id" }
      );

      // Missing tickets
      const res1 = await app.inject({
        method: "POST",
        url: "/api/bookings",
        headers: { authorization: `Bearer ${token}` },
        payload: { eventId: "event-123" },
      });
      expect(res1.statusCode).toBe(400);

      // Missing eventId
      const res2 = await app.inject({
        method: "POST",
        url: "/api/bookings",
        headers: { authorization: `Bearer ${token}` },
        payload: { tickets: 2 },
      });
      expect(res2.statusCode).toBe(400);

      // Empty payload
      const res3 = await app.inject({
        method: "POST",
        url: "/api/bookings",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res3.statusCode).toBe(400);
    });

    it("should create booking and strictly use token sub as userId (Anti-impersonation)", async () => {
      const canonicalUserId = "canonical-user-999";
      const token = await jwksHelper.createToken(
        { email: "owner@seatify.io", role: "authenticated" },
        { subject: canonicalUserId }
      );

      const res = await app.inject({
        method: "POST",
        url: "/api/bookings",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        payload: {
          eventId: "concert-rock-fest",
          tickets: 3,
          userId: "impersonated-attacker-id", // Malicious attempt to spoof owner
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe("Booking created successfully");
      expect(body.booking).toBeDefined();
      expect(body.booking.userId).toBe(canonicalUserId);
      expect(body.booking.userId).not.toBe("impersonated-attacker-id");
      expect(body.booking.eventId).toBe("concert-rock-fest");
      expect(body.booking.tickets).toBe(3);
      expect(body.booking.status).toBe("confirmed");
      expect(body.booking.id).toMatch(/^bkg-\d+/);
    });
  });

  describe("CORS options", () => {
    it("should respond to OPTIONS preflight correctly", async () => {
      const res = await app.inject({
        method: "OPTIONS",
        url: "/api/health",
        headers: {
          origin: "http://localhost:5173",
          "access-control-request-method": "GET",
        },
      });

      expect(res.statusCode).toBe(204);
      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    });
  });
});
