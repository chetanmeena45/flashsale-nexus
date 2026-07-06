import axios from 'axios';

/**
 * Generates a RFC4122-ish correlation id for request tracing across
 * distributed services (gateway -> product-service -> inventory-service, etc).
 * Uses crypto.randomUUID when available (modern browsers / secure contexts),
 * falling back to a timestamp+random string otherwise.
 * @returns {string}
 */
function generateCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Registered via `setCorrelationIdListener` (called once from
 * `useFlashSaleStore.js`). Deliberately kept as a plain module-level
 * callback rather than importing the Zustand store directly here: this
 * file (the API layer) has no business depending on state-management
 * internals, and importing `useFlashSaleStore` here would create a
 * circular import (`axiosConfig` -> `useFlashSaleStore` -> `productApi`
 * -> `axiosConfig`). The store subscribes to this module instead of the
 * reverse, keeping the dependency graph one-directional.
 * @type {((correlationId: string) => void) | null}
 */
let correlationIdListener = null;

/**
 * Registers a callback to be invoked with the backend's echoed
 * `X-Correlation-ID` every time a response (success or error) carries one.
 * Intended to be called exactly once, from the Zustand store, so the UI
 * (e.g. `CorrelationIdDisplay`) can surface the most recent trace id for
 * log searching / support debugging.
 *
 * @param {(correlationId: string) => void} listener
 * @returns {void}
 */
export function setCorrelationIdListener(listener) {
  correlationIdListener = listener;
}

/**
 * Extracts the backend-echoed correlation id from a response's headers,
 * checking both the `X-Correlation-ID` and plain `Correlation-ID` header
 * names (axios normalizes header keys to lowercase), and notifies the
 * registered listener if one is found. Deliberately silent/no-op if the
 * header is absent — a response without a correlation id (e.g. from a
 * proxy/CDN that stripped it) should never throw or break the request flow.
 *
 * @param {import('axios').AxiosResponseHeaders | Record<string, string> | undefined} headers
 * @returns {void}
 */
function captureCorrelationId(headers) {
  const correlationId = headers?.['x-correlation-id'] ?? headers?.['correlation-id'];
  if (correlationId && correlationIdListener) {
    correlationIdListener(correlationId);
  }
}

/**
 * Shared Axios instance for all API calls in the FlashSale Nexus frontend.
 * Base URL is sourced from the Vite environment variable VITE_API_BASE_URL
 * (e.g. https://api.flashsale-nexus.com/v1), allowing per-environment
 * configuration (local, staging, production) without code changes.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: injects a unique Correlation-ID header on every
 * outgoing request. This allows tracing a single client action across
 * multiple backend microservices/log aggregators.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {};
    config.headers['Correlation-ID'] = generateCorrelationId();
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: centralizes handling of HTTP 429 (Too Many Requests)
 * responses, which are expected during high-concurrency flash sale traffic
 * spikes. Attaches a normalized `isRateLimited` flag and, when present,
 * parses the `Retry-After` header (in seconds) so calling code can decide
 * whether to back off, queue, or surface a "please wait" UI state.
 *
 * Also captures the backend's echoed `X-Correlation-ID` from every
 * response — success or error — via `captureCorrelationId`, so the UI can
 * always display the trace id for the most recent request, including
 * failed ones (arguably the case where you need it most for debugging).
 */
axiosInstance.interceptors.response.use(
  (response) => {
    captureCorrelationId(response.headers);
    return response;
  },
  (error) => {
    if (error.response) {
      captureCorrelationId(error.response.headers);
    }

    if (error.response && error.response.status === 429) {
      const retryAfterHeader = error.response.headers?.['retry-after'];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : null;

      error.isRateLimited = true;
      error.retryAfterSeconds = Number.isNaN(retryAfterSeconds) ? null : retryAfterSeconds;

      // eslint-disable-next-line no-console
      console.warn(
        `[axiosConfig] Rate limited (429).${
          retryAfterSeconds ? ` Retry after ${retryAfterSeconds}s.` : ''
        }`
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;