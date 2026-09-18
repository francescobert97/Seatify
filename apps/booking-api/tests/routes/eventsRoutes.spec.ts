import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/server.js";

describe("Events Routes - GET /events and GET /events/:id", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /events (Public)", () => {
    it("should return 200 with list of active events without auth headers", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/events",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("title");
      expect(body[0]).toHaveProperty("category");
      expect(body[0]).toHaveProperty("priceStartingFrom");
    });

    it("should also support GET /api/events prefix", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("GET /events/:id (Public)", () => {
    it("should return 200 and event details when id exists", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/events/evt-1",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.id).toBe("evt-1");
      expect(body.title).toContain("Taylor Swift");
    });

    it("should return 404 when event id does not exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/events/non-existent-event-id",
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe("Not Found");
      expect(body.message).toContain("not found");
    });
  });
});

