import axiosInstance from './axiosConfig';
// eslint-disable-next-line no-unused-vars -- imported for JSDoc @typedef reference
import Product from '../types/product';

const PRODUCTS_ENDPOINT = '/products';

/**
 * Fetches the full list of products available in the flash sale catalog.
 * @returns {Promise<Product[]>} Resolves with an array of Product objects.
 * @throws {import('axios').AxiosError} Propagates network/HTTP errors,
 *   including 429 (rate limited) responses flagged by the response
 *   interceptor with `error.isRateLimited`.
 */
export async function getProducts() {
  const response = await axiosInstance.get(PRODUCTS_ENDPOINT);
  return response.data;
}

/**
 * Fetches a single product by its unique identifier.
 * @param {number} id - The Product's unique id (backend: Long).
 * @returns {Promise<Product>} Resolves with the matching Product object.
 * @throws {import('axios').AxiosError} Propagates network/HTTP errors,
 *   including 404 (not found) and 429 (rate limited) responses.
 */
export async function getProductById(id) {
  const response = await axiosInstance.get(`${PRODUCTS_ENDPOINT}/${id}`);
  return response.data;
}

/**
 * Executes a purchase for a product, submitting the client's known
 * `version` so the backend's JPA `@Version` optimistic locking can reject
 * the write (409) if the entity changed underneath the shopper.
 *
 * Note: `axiosInstance`'s global request interceptor already attaches a
 * `Correlation-ID` header to every call. This function additionally sets
 * `X-Correlation-ID` explicitly on the purchase request per the Phase 9
 * spec — if your backend/gateway expects a single canonical correlation
 * header, reconcile these two into one name to avoid sending both.
 *
 * @param {number} productId - The Product's unique id (backend: Long).
 * @param {number} version - The Product's last-known version (backend: Long).
 * @param {number} quantity - Requested purchase quantity (backend: Integer).
 *   Client-side validation (see `useFlashSaleStore.executePurchase`) should
 *   already guarantee this is a positive integer not exceeding current
 *   stock before this function is ever called.
 * @returns {Promise<Product>} The updated product on success.
 * @throws {Error} A UI-safe error message. For HTTP 429, the message
 *   incorporates the parsed `Retry-After` header (in seconds) when present,
 *   and the thrown error also carries `isRateLimited: true` and
 *   `retryAfterSeconds` for callers that want to build custom UI (e.g. a
 *   countdown) instead of just displaying the message.
 */
export async function executePurchase(productId, version, quantity) {
  const correlationId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `xcid-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const payload = {
    id: productId,
    version,
    quantity,
  };

  try {
    const response = await axiosInstance.post(
      `${PRODUCTS_ENDPOINT}/${productId}/purchase`,
      payload,
      { headers: { 'X-Correlation-ID': correlationId } }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers?.['retry-after'];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : null;
      const waitMessage =
        Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? `Please try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'}.`
          : 'Please try again shortly.';

      const rateLimitError = new Error(`Too many requests. ${waitMessage}`);
      rateLimitError.isRateLimited = true;
      rateLimitError.retryAfterSeconds = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null;
      throw rateLimitError;
    }

    if (error.response?.status === 409) {
      const conflictError = new Error(
        'This item was updated by another shopper. Please refresh and try again.'
      );
      conflictError.isConflict = true;
      throw conflictError;
    }

    throw new Error(error.response?.data?.message || 'Purchase failed. Please try again.');
  }
}

export default {
  getProducts,
  getProductById,
  executePurchase,
};