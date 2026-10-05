// API client configuration with intelligent caching & request deduplication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rru-backend-1.onrender.com';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  cache?: boolean;
  ttl?: number;
  invalidateCache?: boolean;
}

interface CacheEntry<T = any> {
  data: T;
  expiresAt: number;
}

class ApiClient {
  private baseUrl: string;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      const sortedEntries = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .sort(([a], [b]) => a.localeCompare(b));

      sortedEntries.forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  /** Clear all cached API responses or entries matching a path pattern. */
  clearCache(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  private async fetchDirect<T>(
    url: string,
    {
      method,
      headers,
      body,
    }: {
      method: string;
      headers: Record<string, string>;
      body?: unknown;
    },
  ): Promise<T> {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `API Error: ${res.status}`);
    }

    return res.json();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      cache: useCache = true,
      ttl = 5 * 60 * 1000, // 5 minutes default TTL
      invalidateCache,
    } = options;

    const url = this.buildUrl(path, params);

    // Mutations (PUT, PATCH, DELETE) or explicit cache bypass
    if (method !== 'GET' || !useCache) {
      const shouldInvalidate = invalidateCache ?? (method === 'PUT' || method === 'PATCH' || method === 'DELETE');
      if (shouldInvalidate) {
        this.clearCache();
      }
      return this.fetchDirect<T>(url, { method, headers, body });
    }

    const cacheKey = `${method}:${url}`;

    // 1. Return cached response if valid and not expired
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // 2. Deduplicate identical in-flight requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 3. Perform network fetch and store result in cache & pendingRequests
    const requestPromise = (async () => {
      try {
        const data = await this.fetchDirect<T>(url, { method, headers, body });
        this.cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl,
        });
        return data;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: Omit<RequestOptions, 'method' | 'params'>,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET', params });
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(
    path: string,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export { USE_MOCK };

