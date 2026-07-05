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

export default {
  getProducts,
  getProductById,
};