import { NitrosendError } from './errors.js';
import { camelToSnake, toSnakeBody, toCamelBody } from './utils.js';

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestOptions {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ClientResponse<T> {
  data: T;
  headers: Headers;
}

const RETRY_DELAYS = [100, 300];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class NitrosendClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? 'https://api.nitrosend.com').replace(/\/$/, '');
    this.timeout = options.timeout ?? 30_000;
  }

  async request<T>(method: string, path: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    const url = this.buildUrl(path, options?.query);
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      ...options?.headers,
    };

    let fetchBody: string | undefined;
    if (options?.body) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(toSnakeBody(options.body));
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: fetchBody,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.status >= 500 && attempt < RETRY_DELAYS.length) {
          lastError = new Error(`Server error ${response.status}`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }

        if (response.status === 204) {
          return { data: undefined as T, headers: response.headers };
        }

        const rawBody: unknown = await response.json();

        if (!response.ok) {
          throw NitrosendError.fromResponse(response.status, rawBody);
        }

        return {
          data: toCamelBody(rawBody) as T,
          headers: response.headers,
        };
      } catch (error) {
        clearTimeout(timer);

        if (error instanceof NitrosendError) throw error;

        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new NitrosendError('Request timed out', 0, 'TIMEOUT');
        }

        lastError = error as Error;

        if (attempt < RETRY_DELAYS.length) {
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
      }
    }

    throw lastError ?? new NitrosendError('Request failed', 0, 'UNKNOWN');
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(camelToSnake(key), String(value));
        }
      }
    }

    return url.toString();
  }
}
