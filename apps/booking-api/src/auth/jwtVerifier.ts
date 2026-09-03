import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { AuthenticatedUser } from "../types/auth.js";

let cachedJwksUrl: string | null = null;
let remoteJWKSet: JWTVerifyGetKey | null = null;

function getRemoteJWKSet(url: string): JWTVerifyGetKey {
  const jwksUrl = `${url.replace(/\/+$/, "")}/auth/v1/.well-known/jwks.json`;
  if (!remoteJWKSet || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    remoteJWKSet = createRemoteJWKSet(new URL(jwksUrl));
  }
  return remoteJWKSet;
}

/**
 * Cryptographically verifies a Supabase-issued JWT using asymmetric
 * key verification via the Supabase JWKS endpoint.
 *
 * Supabase signs tokens with ECC (P-256 / ES256). The public keys are
 * fetched and cached from:
 *   <SUPABASE_URL>/auth/v1/.well-known/jwks.json
 *
 * Verification ensures:
 * 1. Signature validity via Supabase JWKS public keys.
 * 2. Token expiration (exp).
 * 3. Issuer matching the configured Supabase project.
 * 4. Audience matching 'authenticated'.
 * 5. Extraction of canonical user ID strictly from the verified 'sub' claim.
 */
export async function verifySupabaseToken(token: string): Promise<AuthenticatedUser> {
  if (!token) {
    throw new Error("Token must be provided");
  }

  const supabaseUrl = process.env.SUPABASE_URL || "";

  if (!supabaseUrl) {
    throw new Error(
      "JWT verifier unconfigured: Please set SUPABASE_URL in your environment to enable token verification via JWKS."
    );
  }

  const jwks = getRemoteJWKSet(supabaseUrl);
  const issuer = `${supabaseUrl.replace(/\/+$/, "")}/auth/v1`;

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: "authenticated",
  });

  if (!payload.sub) {
    throw new Error("Invalid token: missing subject (sub) claim");
  }

  return {
    id: payload.sub,
    email: payload.email as string | undefined,
    role: payload.role as string | undefined,
    app_metadata: payload.app_metadata as Record<string, unknown> | undefined,
    user_metadata: payload.user_metadata as Record<string, unknown> | undefined,
  };
}
