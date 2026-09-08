import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase, getAccessToken } from "../../src/auth/supabase";
import { AuthError } from "@supabase/supabase-js";

describe("supabase client & getAccessToken", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should export a configured supabase instance", () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it("should return the access token when a session is active", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: {
        session: {
          access_token: "active-access-token-123",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: 1800000000,
          refresh_token: "refresh-123",
          user: { id: "user-123", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" },
        },
      },
      error: null,
    });

    const token = await getAccessToken();
    expect(token).toBe("active-access-token-123");
  });

  it("should return null when getSession returns an error or no session", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: new AuthError(
        "No session found",
        400,
        "session_not_found"
      ),
    });

    const token = await getAccessToken();
    expect(token).toBeNull();
  });

  it("should return null when getSession throws an exception", async () => {
    vi.spyOn(supabase.auth, "getSession").mockRejectedValueOnce(new Error("Network failed"));

    const token = await getAccessToken();
    expect(token).toBeNull();
  });
});
