import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchHealthCheck } from "../../src/services/api";
import { httpClient } from "../../src/services/httpClient";

describe("api service - fetchHealthCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call httpClient.get with /api/health and return the health response", async () => {
    const mockHealth = { status: "ok", message: "Booking API Attiva" };
    const getSpy = vi.spyOn(httpClient, "get").mockResolvedValue(mockHealth);

    const result = await fetchHealthCheck();

    expect(getSpy).toHaveBeenCalledWith("/api/health");
    expect(result).toEqual(mockHealth);
  });
});
