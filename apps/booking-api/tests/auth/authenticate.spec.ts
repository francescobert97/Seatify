import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { authenticate } from "../../src/auth/authenticate.js";
import { setupMockJwks, MockJwksHelper } from "../helpers/mockJwks.js";
import "../../src/types/auth.js";

describe("authenticate preHandler hook", () => {
  let app: FastifyInstance;
  let jwksHelper: MockJwksHelper;

  beforeAll(async () => {
    jwksHelper = await setupMockJwks("https://test-auth-hook.supabase.co");
    process.env.SUPABASE_URL = jwksHelper.url;

    app = Fastify();
    app.get("/test-protected", { preHandler: authenticate }, async (req) => {
      return { ok: true, user: req.user };
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    jwksHelper.restore();
    delete process.env.SUPABASE_URL;
  });

  it("should return 401 when Authorization header is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("Unauthorized");
    expect(body.message).toBe("Missing Authorization header");
  });

  it("should return 401 when Authorization header does not start with Bearer", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
      headers: {
        authorization: "Basic 12345",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("Unauthorized");
    expect(body.message).toContain("Malformed Authorization header");
  });

  it("should return 401 when Bearer token is empty or whitespace", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
      headers: {
        authorization: "Bearer   ",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("Unauthorized");
    expect(body.message).toBe("Missing Bearer token");
  });

  it("should return 401 when token is invalid or fails verification", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
      headers: {
        authorization: "Bearer invalid.jwt.signature",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe("Unauthorized");
  });

  it("should succeed and attach request.user when token is valid", async () => {
    const validToken = await jwksHelper.createToken(
      { email: "user@seatify.io", role: "authenticated" },
      { subject: "user-456" }
    );

    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.ok).toBe(true);
    expect(body.user.id).toBe("user-456");
    expect(body.user.email).toBe("user@seatify.io");
  });

  it("should return default error message when verification throws a non-Error", async () => {
    const jwtVerifierModule = await import("../../src/auth/jwtVerifier.js");
    const spy = vi.spyOn(jwtVerifierModule, "verifySupabaseToken").mockRejectedValueOnce("string-error");

    const res = await app.inject({
      method: "GET",
      url: "/test-protected",
      headers: { authorization: "Bearer some.token" },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.message).toBe("Invalid or expired token");
    spy.mockRestore();
  });
});
