import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateKeyPair, SignJWT } from "jose";
import { verifySupabaseToken } from "../../src/auth/jwtVerifier.js";
import { setupMockJwks, MockJwksHelper } from "../helpers/mockJwks.js";

describe("jwtVerifier - verifySupabaseToken", () => {
  let jwksHelper: MockJwksHelper;

  beforeAll(async () => {
    jwksHelper = await setupMockJwks("https://test-project.supabase.co");
    process.env.SUPABASE_URL = jwksHelper.url;
  });

  afterAll(() => {
    jwksHelper.restore();
    delete process.env.SUPABASE_URL;
  });

  it("should throw an error when token is empty", async () => {
    await expect(verifySupabaseToken("")).rejects.toThrow("Token must be provided");
  });

  it("should throw an error when SUPABASE_URL is not set", async () => {
    const originalUrl = process.env.SUPABASE_URL;
    delete process.env.SUPABASE_URL;

    try {
      await expect(verifySupabaseToken("some.dummy.token")).rejects.toThrow(
        "JWT verifier unconfigured: Please set SUPABASE_URL in your environment to enable token verification via JWKS."
      );
    } finally {
      process.env.SUPABASE_URL = originalUrl;
    }
  });

  it("should verify a valid ES256 JWT and return the user payload", async () => {
    const token = await jwksHelper.createToken(
      {
        email: "alice@example.com",
        role: "authenticated",
        app_metadata: { provider: "email" },
        user_metadata: { name: "Alice" },
      },
      { subject: "user-alice-123" }
    );

    const user = await verifySupabaseToken(token);
    expect(user).toBeDefined();
    expect(user.id).toBe("user-alice-123");
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe("authenticated");
    expect(user.app_metadata).toEqual({ provider: "email" });
    expect(user.user_metadata).toEqual({ name: "Alice" });
  });

  it("should reject an expired JWT", async () => {
    const token = await jwksHelper.createToken(
      { email: "bob@example.com", role: "authenticated" },
      { subject: "user-bob-expired", expiresIn: "-10s" }
    );

    await expect(verifySupabaseToken(token)).rejects.toThrow();
  });

  it("should reject a JWT with an invalid/mismatched issuer", async () => {
    const token = await jwksHelper.createToken(
      { email: "charlie@example.com", role: "authenticated" },
      { subject: "user-charlie", issuer: "https://impostor.supabase.co/auth/v1" }
    );

    await expect(verifySupabaseToken(token)).rejects.toThrow();
  });

  it("should reject a JWT with an invalid audience", async () => {
    const token = await jwksHelper.createToken(
      { email: "david@example.com", role: "anon" },
      { subject: "user-david", audience: "anon" }
    );

    await expect(verifySupabaseToken(token)).rejects.toThrow();
  });

  it("should reject a JWT signed by an untrusted key", async () => {
    const { privateKey } = await generateKeyPair("ES256");
    const untrustedToken = await new SignJWT({ email: "untrusted@example.com" })
      .setProtectedHeader({ alg: "ES256", kid: "unknown-key" })
      .setSubject("user-untrusted")
      .setIssuer(`${jwksHelper.url}/auth/v1`)
      .setAudience("authenticated")
      .setExpirationTime("1h")
      .sign(privateKey);

    await expect(verifySupabaseToken(untrustedToken)).rejects.toThrow();
  });

  it("should throw when token payload is missing 'sub' claim", async () => {
    let builder = new SignJWT({ email: "nosub@example.com" })
      .setProtectedHeader({ alg: "ES256", kid: "test-ec-key-id" })
      .setIssuer(`${jwksHelper.url}/auth/v1`)
      .setAudience("authenticated")
      .setExpirationTime("1h");

    const tokenWithoutSub = await builder.sign(jwksHelper.privateKey);

    await expect(verifySupabaseToken(tokenWithoutSub)).rejects.toThrow(
      "Invalid token: missing subject (sub) claim"
    );
  });
});
