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
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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