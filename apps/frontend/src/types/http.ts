export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestConfig<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: TBody;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data?: unknown;
  public readonly isNetworkError: boolean;
  public readonly isAborted: boolean;

  constructor({
    message,
    status = 0,
    statusText = "",
    data,
    isNetworkError = false,
    isAborted = false,
  }: {
    message: string;
    status?: number;
    statusText?: string;
    data?: unknown;
    isNetworkError?: boolean;
    isAborted?: boolean;
  }) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isNetworkError = isNetworkError;
    this.isAborted = isAborted;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export interface UseFetchState<TData> {
  data: TData | null;
  error: HttpError | null;
  isLoading: boolean;
}

export interface UseFetchReturn<TData, TBody = unknown> extends UseFetchState<TData> {
  execute: (configOrUrl: string | HttpRequestConfig<TBody>) => Promise<TData | null>;
  reset: () => void;
}

