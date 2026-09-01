import { useState, useCallback, useRef, useEffect } from "react";
import { httpClient } from "../services/httpClient";
import { HttpError, HttpRequestConfig, UseFetchReturn, UseFetchState } from "../types/http";

export function useFetch<TData = unknown, TBody = unknown>(): UseFetchReturn<TData, TBody> {
  const [state, setState] = useState<UseFetchState<TData>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const activeControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
        activeControllerRef.current = null;
      }
    };
  }, []);

  const reset = useCallback((): void => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setState({
        data: null,
        error: null,
        isLoading: false,
      });
    }
  }, []);

  const execute = useCallback(
    async (configOrUrl: string | HttpRequestConfig<TBody>): Promise<TData | null> => {
      // Abort any active in-flight request triggered by this hook
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }

      const controller = new AbortController();
      activeControllerRef.current = controller;

      const requestConfig: HttpRequestConfig<TBody> =
        typeof configOrUrl === "string" ? { url: configOrUrl } : configOrUrl;

      // Link abort signals if caller also provided a custom signal
      let effectiveSignal = controller.signal;
      if (requestConfig.signal) {
        if (typeof AbortSignal.any === "function") {
          effectiveSignal = AbortSignal.any([controller.signal, requestConfig.signal]);
        } else {
          requestConfig.signal.addEventListener("abort", () => controller.abort());
        }
      }

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));
      }

      try {
        const responseData = await httpClient.request<TData, TBody>({
          ...requestConfig,
          signal: effectiveSignal,
        });

        if (isMountedRef.current && activeControllerRef.current === controller) {
          setState({
            data: responseData,
            error: null,
            isLoading: false,
          });
          activeControllerRef.current = null;
        }

        return responseData;
      } catch (err: unknown) {
        const httpError =
          err instanceof HttpError
            ? err
            : new HttpError({
                message: err instanceof Error ? err.message : "Unknown error occurred",
              });

        // Don't update state if the request was intentionally aborted
        if (httpError.isAborted) {
          return null;
        }

        if (isMountedRef.current && activeControllerRef.current === controller) {
          setState({
            data: null,
            error: httpError,
            isLoading: false,
          });
          activeControllerRef.current = null;
        }

        return null;
      }
    },
    []
  );

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    execute,
    reset,
  };
}

