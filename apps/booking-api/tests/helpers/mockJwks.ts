import { SignJWT, exportJWK, generateKeyPair, type CryptoKey } from "jose";

export interface MockJwksHelper {
  url: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  createToken: (
    claims?: Record<string, unknown>,
    options?: { subject?: string; expiresIn?: string; issuer?: string; audience?: string; kid?: string }
  ) => Promise<string>;
  restore: () => void;
}

export async function setupMockJwks(
  fakeSupabaseUrl = "https://mock-project.supabase.co"
): Promise<MockJwksHelper> {
  const { publicKey, privateKey } = await generateKeyPair("ES256");

  const jwk = await exportJWK(publicKey);
  jwk.kid = "test-ec-key-id";
  jwk.use = "sig";
  jwk.alg = "ES256";

  const jwksPayload = JSON.stringify({ keys: [jwk] });
  const expectedJwksPath = "/auth/v1/.well-known/jwks.json";

  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlString = input.toString();
    if (urlString.includes(expectedJwksPath)) {
      return new Response(jwksPayload, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (originalFetch) {
      return originalFetch(input, init);
    }

    return new Response("Not Found", { status: 404 });
  }) as typeof fetch;

  const createToken = async (
    claims: Record<string, unknown> = {},
    options: { subject?: string; expiresIn?: string; issuer?: string; audience?: string; kid?: string } = {}
  ): Promise<string> => {
    const issuer = options.issuer ?? `${fakeSupabaseUrl}/auth/v1`;
    const audience = options.audience ?? "authenticated";
    const expiresIn = options.expiresIn ?? "1h";
    const kid = options.kid ?? "test-ec-key-id";

    let builder = new SignJWT(claims)
      .setProtectedHeader({ alg: "ES256", kid })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt();

    if (options.subject) {
      builder = builder.setSubject(options.subject);
    }

    builder = builder.setExpirationTime(expiresIn);

    return builder.sign(privateKey);
  };

  const restore = (): void => {
    globalThis.fetch = originalFetch;
  };

  return {
    url: fakeSupabaseUrl,
    publicKey,
    privateKey,
    createToken,
    restore,
  };
}
