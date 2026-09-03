import { API_BASE_URL, DEFAULT_HEADERS } from "../config/api";
import { HttpError, HttpRequestConfig } from "../types/http";

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private authTokenProvider?: () => Promise<string | null>;

  constructor(baseUrl: string = API_BASE_URL, defaultHeaders: Record<string, string> = DEFAULT_HEADERS) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  public setAuthTokenProvider(provider: () => Promise<string | null>): void {
    this.authTokenProvider = provider;
  }

  private buildUrl(url: string, params?: HttpRequestConfig["params"]): string {
    // Determine if URL is absolute
    const isAbsolute = /^https?:\/\//i.test(url);
    const resolvedUrl = isAbsolute
      ? url
      : `${this.baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;

    if (!params) {
      return resolvedUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (!queryString) {
      return resolvedUrl;
    }

    const separator = resolvedUrl.includes("?") ? "&" : "?";
    return `${resolvedUrl}${separator}${queryString}`;
  }

  public async request<TData = unknown, TBody = unknown>(
    config: HttpRequestConfig<TBody>
  ): Promise<TData> {
    const { url, method = "GET", headers = {}, params, body, signal, requiresAuth } = config;
    const fullUrl = this.buildUrl(url, params);

    const mergedHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Attach Authorization header if auth is enabled and token is available
    if (requiresAuth !== false && this.authTokenProvider) {
      try {
        const token = await this.authTokenProvider();
        if (token) {
          mergedHeaders["Authorization"] = `Bearer ${token}`;
        } else if (requiresAuth === true) {
          // If request strictly required auth and user is unauthenticated
          throw new HttpError({
            message: "Authentication required but no active session found",
            status: 401,
            statusText: "Unauthorized",
          });
        }
      } catch (err) {
        if (err instanceof HttpError) throw err;
        // Proceed or handle provider error
      }
    }

    let serializedBody: BodyInit | undefined;
    if (body !== undefined && body !== null) {
      if (
        typeof body === "string" ||
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof URLSearchParams
      ) {
        serializedBody = body as BodyInit;
        if (body instanceof FormData) {
          // Let the browser set the boundary header automatically
          delete mergedHeaders["Content-Type"];
        }
      } else {
        serializedBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: mergedHeaders,
        body: serializedBody,
        signal,
      });

      if (!response.ok) {
        let errorData: unknown;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            errorData = await response.json();
          } catch {
            errorData = null;
          }
        } else {
          try {
            errorData = await response.text();
          } catch {
            errorData = null;
          }
        }

        throw new HttpError({
          message: `HTTP Error ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
      }

      // Handle 204 No Content or empty responses
      if (response.status === 204) {
        return null as TData;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = (await response.json()) as TData;
        return data;
      }

      const textData = (await response.text()) as unknown as TData;
      return textData;
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new HttpError({
          message: "Request was aborted",
          isAborted: true,
        });
      }

      const errorMessage = err instanceof Error ? err.message : "Network error";
      throw new HttpError({
        message: `Network error: ${errorMessage}`,
        isNetworkError: true,
      });
    }
  }

  public async get<TData = unknown>(
    url: string,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<TData> {
    return this.request<TData>({ ...config, url, method: "GET" });
  }

  public async post<TData = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig<TBody>, "url" | "method" | "body">
  ): Promise<TData> {
    return this.request<TData, TBody>({ ...config, url, method: "POST", body });
  }

  public async put<TData = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig<TBody>, "url" | "method" | "body">
  ): Promise<TData> {
    return this.request<TData, TBody>({ ...config, url, method: "PUT", body });
  }

  public async patch<TData = unknown, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Omit<HttpRequestConfig<TBody>, "url" | "method" | "body">
  ): Promise<TData> {
    return this.request<TData, TBody>({ ...config, url, method: "PATCH", body });
  }

  public async delete<TData = unknown>(
    url: string,
    config?: Omit<HttpRequestConfig, "url" | "method" | "body">
  ): Promise<TData> {
    return this.request<TData>({ ...config, url, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();

