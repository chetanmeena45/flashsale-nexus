/**
 * @typedef {Object} Product
 * @property {number} id - Unique identifier for the product (backend: Long).
 * @property {string} name - Display name of the product.
 * @property {number} stock - Current available stock count (backend: Integer).
 * @property {number} stockQuantity - Total/reserved stock quantity tracked for
 *   inventory reconciliation purposes (backend: Integer).
 * @property {number} price - Unit price of the product (backend: BigDecimal).
 *   Represented as a JS number; treat as a decimal-safe value on the client
 *   (avoid floating point arithmetic for currency calculations where possible).
 * @property {number} version - Optimistic locking version number used to
 *   detect concurrent modification conflicts (backend: Long).
 */

// This file only exports a JSDoc type definition for use across the API
// layer via `@type {Product}` / `@returns {Promise<Product>}` annotations.
// No runtime export is needed, but we export an empty object so the file
// can still be imported without side effects if ever required directly.
export default {};