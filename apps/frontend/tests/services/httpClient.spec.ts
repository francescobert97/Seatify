import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HttpClient, httpClient } from "../../src/services/httpClient";
import { HttpError } from "../../src/types/http";

describe("HttpClient", () => {
  let originalFetch: typeof globalThis.fetch;
  let lastCapturedUrl = "";
  let lastCapturedInit: RequestInit | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    lastCapturedUrl = "";
    lastCapturedInit = undefined;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetchResponse(response: {
    status?: number;
    statusText?: string;
    body?: unknown;
    contentType?: string;
  }) {
    const {
      status = 200,
      statusText = "OK",
      body = { status: "ok" },
      contentType = "application/json",
    } = response;

    globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      lastCapturedUrl = input.toString();
      lastCapturedInit = init;

      const headers = new Headers();
      if (contentType) {
        headers.set("content-type", contentType);
      }

      const bodyContent =
        typeof body === "string" ? body : body !== null ? JSON.stringify(body) : null;

      return new Response(bodyContent, {
        status,
        statusText,
        headers,
      });
    });
  }

  it("should make an unauthenticated request without Authorization header", async () => {
    mockFetchResponse({ body: { data: "test" } });
    const client = new HttpClient("http://localhost:8080");

    const result = await client.get("/api/events");

    expect(result).toEqual({ data: "test" });
    expect(lastCapturedUrl).toBe("http://localhost:8080/api/events");
    const headers = lastCapturedInit?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("should attach Authorization: Bearer <token> when token provider is set", async () => {
    mockFetchResponse({ body: { profile: "jane" } });
    const client = new HttpClient("http://localhost:8080");
    client.setAuthTokenProvider(async () => "jwt-token-xyz");

    const result = await client.get("/api/me");

    expect(result).toEqual({ profile: "jane" });
    const headers = lastCapturedInit?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer jwt-token-xyz");
  });

  it("should omit Authorization header when requiresAuth is false even if token provider exists", async () => {
    mockFetchResponse({ body: { public: true } });
    const client = new HttpClient("http://localhost:8080");
    client.setAuthTokenProvider(async () => "jwt-token-xyz");

    await client.get("/api/health", { requiresAuth: false });

    const headers = lastCapturedInit?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("should throw HttpError 401 when requiresAuth is true but no token is provided", async () => {
    const client = new HttpClient("http://localhost:8080");
    client.setAuthTokenProvider(async () => null);

    await expect(client.get("/api/strict", { requiresAuth: true })).rejects.toThrow(HttpError);
  });

  it("should support absolute URLs and multiple backend targets", async () => {
    mockFetchResponse({ body: { ok: true } });
    const client = new HttpClient("http://localhost:8080");

    await client.get("https://external-api.example.com/status");

    expect(lastCapturedUrl).toBe("https://external-api.example.com/status");
  });

  it("should serialize query parameters properly", async () => {
    mockFetchResponse({ body: [] });
    const client = new HttpClient("http://localhost:8080");

    await client.get("/api/events", {
      params: {
        category: "concerts",
        page: 1,
        featured: true,
        empty: undefined,
        nullVal: null,
      },
    });

    expect(lastCapturedUrl).toBe(
      "http://localhost:8080/api/events?category=concerts&page=1&featured=true"
    );
  });

  it("should append query parameters with & when URL already has query string", async () => {
    mockFetchResponse({ body: [] });
    const client = new HttpClient("http://localhost:8080");

    await client.get("/api/search?q=rock", {
      params: { page: 2 },
    });

    expect(lastCapturedUrl).toBe("http://localhost:8080/api/search?q=rock&page=2");
  });

  it("should serialize body for POST, PUT, PATCH, and DELETE requests", async () => {
    mockFetchResponse({ body: { created: true }, status: 200 });
    const client = new HttpClient("http://localhost:8080");

    // POST with JSON body
    await client.post("/api/events", { title: "Rock Show" });
    expect(lastCapturedInit?.method).toBe("POST");
    expect(lastCapturedInit?.body).toBe(JSON.stringify({ title: "Rock Show" }));

    // PUT
    await client.put("/api/events/1", { title: "Updated" });
    expect(lastCapturedInit?.method).toBe("PUT");
    expect(lastCapturedInit?.body).toBe(JSON.stringify({ title: "Updated" }));

    // PATCH
    await client.patch("/api/events/1", { status: "active" });
    expect(lastCapturedInit?.method).toBe("PATCH");
    expect(lastCapturedInit?.body).toBe(JSON.stringify({ status: "active" }));

    // DELETE
    await client.delete("/api/events/1");
    expect(lastCapturedInit?.method).toBe("DELETE");
  });

  it("should handle FormData body and remove Content-Type to allow browser boundary", async () => {
    mockFetchResponse({ body: { uploaded: true } });
    const client = new HttpClient("http://localhost:8080");

    const formData = new FormData();
    formData.append("file", "dummy-content");

    await client.post("/api/upload", formData);

    const headers = lastCapturedInit?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
    expect(lastCapturedInit?.body).toBe(formData);
  });

  it("should handle 204 No Content response returning null", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
        statusText: "No Content",
      })
    );
    const client = new HttpClient("http://localhost:8080");

    const result = await client.delete("/api/events/123");
    expect(result).toBeNull();
  });

  it("should handle non-json plain text response", async () => {
    mockFetchResponse({
      body: "plain text response",
      contentType: "text/plain",
    });
    const client = new HttpClient("http://localhost:8080");

    const result = await client.get("/api/robots.txt");
    expect(result).toBe("plain text response");
  });

  it("should throw HttpError with JSON error payload on HTTP failure", async () => {
    mockFetchResponse({
      status: 404,
      statusText: "Not Found",
      body: { error: "Event not found" },
    });
    const client = new HttpClient("http://localhost:8080");

    try {
      await client.get("/api/events/999");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(404);
      expect(httpErr.statusText).toBe("Not Found");
      expect(httpErr.data).toEqual({ error: "Event not found" });
    }
  });

  it("should throw HttpError with text payload when error response is not JSON", async () => {
    mockFetchResponse({
      status: 500,
      statusText: "Internal Server Error",
      body: "Fatal crash",
      contentType: "text/html",
    });
    const client = new HttpClient("http://localhost:8080");

    try {
      await client.get("/api/crash");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.status).toBe(500);
      expect(httpErr.data).toBe("Fatal crash");
    }
  });

  it("should handle AbortError when request is aborted", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new DOMException("The user aborted a request.", "AbortError")
    );
    const client = new HttpClient("http://localhost:8080");

    try {
      await client.get("/api/aborted");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.isAborted).toBe(true);
      expect(httpErr.message).toBe("Request was aborted");
    }
  });

  it("should handle generic network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));
    const client = new HttpClient("http://localhost:8080");

    try {
      await client.get("/api/offline");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      const httpErr = err as HttpError;
      expect(httpErr.isNetworkError).toBe(true);
      expect(httpErr.message).toContain("Failed to fetch");
    }
  });

  it("should handle token provider error gracefully when not HttpError", async () => {
    mockFetchResponse({ body: { ok: true } });
    const client = new HttpClient("http://localhost:8080");
    client.setAuthTokenProvider(async () => {
      throw new Error("Token failure");
    });

    const result = await client.get("/api/unprotected");
    expect(result).toEqual({ ok: true });
  });

  it("should provide default exported httpClient singleton", () => {
    expect(httpClient).toBeInstanceOf(HttpClient);
  });
});
