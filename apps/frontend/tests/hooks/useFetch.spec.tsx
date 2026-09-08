import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFetch } from "../../src/hooks/useFetch";
import { httpClient } from "../../src/services/httpClient";
import { HttpError } from "../../src/types/http";

describe("useFetch Hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    const { result } = renderHook(() => useFetch<{ id: number }>());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should successfully fetch and update state when execute is called with a string URL", async () => {
    const mockData = { id: 1, title: "Test Event" };
    vi.spyOn(httpClient, "request").mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useFetch<typeof mockData>());

    let fetchPromise: Promise<typeof mockData | null>;
    act(() => {
      fetchPromise = result.current.execute("/api/events/1");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await fetchPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("should pass HttpRequestConfig options to httpClient.request", async () => {
    const requestSpy = vi.spyOn(httpClient, "request").mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await result.current.execute({
        url: "/api/submit",
        method: "POST",
        body: { name: "Seatify" },
      });
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/submit",
        method: "POST",
        body: { name: "Seatify" },
      })
    );
  });

  it("should set error state when httpClient.request throws an HttpError", async () => {
    const httpError = new HttpError({
      message: "Not found",
      status: 404,
      statusText: "Not Found",
    });
    vi.spyOn(httpClient, "request").mockRejectedValueOnce(httpError);

    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await result.current.execute("/api/missing");
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(httpError);
  });

  it("should convert generic error to HttpError if rejected with a standard Error", async () => {
    vi.spyOn(httpClient, "request").mockRejectedValueOnce(new Error("Unexpected crash"));

    const { result } = renderHook(() => useFetch());

    await act(async () => {
      await result.current.execute("/api/crash");
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(HttpError);
    expect(result.current.error?.message).toBe("Unexpected crash");
  });

  it("should ignore aborted requests without updating error state", async () => {
    const abortError = new HttpError({
      message: "Request was aborted",
      isAborted: true,
    });
    vi.spyOn(httpClient, "request").mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => useFetch());

    await act(async () => {
      const res = await result.current.execute("/api/aborted");
      expect(res).toBeNull();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("should abort in-flight request when execute is called multiple times", async () => {
    let capturedSignal1: AbortSignal | undefined;
    let capturedSignal2: AbortSignal | undefined;

    vi.spyOn(httpClient, "request")
      .mockImplementationOnce(async (config) => {
        capturedSignal1 = config.signal;
        await new Promise((r) => setTimeout(r, 50));
        return { first: true };
      })
      .mockImplementationOnce(async (config) => {
        capturedSignal2 = config.signal;
        return { second: true };
      });

    const { result } = renderHook(() => useFetch());

    act(() => {
      result.current.execute("/api/first");
    });

    await act(async () => {
      await result.current.execute("/api/second");
    });

    expect(capturedSignal1?.aborted).toBe(true);
    expect(capturedSignal2?.aborted).toBe(false);
    expect(result.current.data).toEqual({ second: true });
  });

  it("should reset state and abort active request on reset()", () => {
    const { result } = renderHook(() => useFetch());

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should abort active request on unmount", () => {
    let capturedSignal: AbortSignal | undefined;
    vi.spyOn(httpClient, "request").mockImplementationOnce(async (config) => {
      capturedSignal = config.signal;
      await new Promise((r) => setTimeout(r, 100));
      return { ok: true };
    });

    const { result, unmount } = renderHook(() => useFetch());

    act(() => {
      result.current.execute("/api/long");
    });

    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
