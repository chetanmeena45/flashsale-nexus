import { create } from 'zustand';
import { executePurchase as executePurchaseApi } from '../api/productApi';
import { setCorrelationIdListener } from '../api/axiosConfig';

// eslint-disable-next-line no-unused-vars -- imported for JSDoc @typedef reference
import Product from '../types/product';

/**
 * Generates a unique id for a `PurchaseEvent`, so a notification layer can
 * key a `useEffect` on it and fire exactly once per attempt.
 * @returns {string}
 */
function generateEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @typedef {Object} FlashSaleState
 * @property {Product[]} products - The full list of products currently loaded
 *   from the API (see `getProducts` in `api/productApi.js`).
 * @property {Product[]} cart - Items the user has added to their cart.
 * @property {boolean} isLoading - Tracks in-flight API/loading state so UI
 *   components (product grid, cart drawer, etc.) can render spinners/skeletons.
 * @property {(products: Product[]) => void} setProducts - Replaces the
 *   current product list, typically after a successful `getProducts()` call.
 * @property {(product: Product) => void} addToCart - Adds a product to the
 *   cart. Guards against duplicate entries by `id`; if the product is already
 *   present, this is a no-op (extend here if quantity-based stacking is
 *   needed later).
 * @property {(productId: number) => void} removeFromCart - Removes a cart
 *   item matching the given product id.
 * @property {(isLoading: boolean) => void} setLoading - Toggles the loading
 *   flag around async operations (fetches, checkout, etc.).
 * @property {boolean} isProcessing - True while a purchase request is in flight.
 * @property {string | null} error - The most recent purchase error message, if any.
 * @property {(productId: number, version: number, quantity: number) => Promise<void>} executePurchase -
 *   Executes a purchase for a product/version/quantity triple via the productApi,
 *   after validating the requested quantity against current stock client-side.
 * @property {PurchaseEvent | null} lastPurchaseEvent - The most recent purchase
 *   outcome, emitted once per attempt so a notification layer (e.g.
 *   `usePurchaseNotifications`) can react to it exactly once via its `id`,
 *   independent of whatever the current `error` string happens to be.
 * @property {string | null} lastCorrelationId - The `X-Correlation-ID` echoed
 *   back by the backend on the most recent request (success or error),
 *   captured via `setCorrelationIdListener` in `api/axiosConfig.js`. Surfaced
 *   in the UI by `CorrelationIdDisplay` for support/log-search debugging.
 */

/**
 * @typedef {Object} PurchaseEvent
 * @property {string} id - Unique id for this event, so a `useEffect` keyed on
 *   `lastPurchaseEvent?.id` fires exactly once per attempt, even if two
 *   consecutive attempts produce the identical status/message.
 * @property {'success' | 'rate_limited' | 'conflict' | 'error'} status - The
 *   outcome type, used to pick a toast color/style.
 * @property {string} message - Human-readable message ready to show as-is.
 */

/**
 * Global Zustand store for the FlashSale Nexus frontend.
 * Centralizes product catalog state and cart state so both can be shared
 * across independently-routed pages in the MPA (e.g. product listing page,
 * product detail page, cart page) without prop drilling or duplicated fetches.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<FlashSaleState>>}
 */
const useFlashSaleStore = create((set, get) => ({
  products: [],
  cart: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  lastPurchaseEvent: null,
  lastCorrelationId: null,

  /**
   * Updates the product list, e.g. after fetching from the API.
   * @param {Product[]} products
   */
  setProducts: (products) => set({ products }),

  /**
   * Adds a product to the cart. Prevents duplicate entries by id.
   * @param {Product} product
   */
  addToCart: (product) => {
    const alreadyInCart = get().cart.some((item) => item.id === product.id);
    if (alreadyInCart) {
      return;
    }
    set((state) => ({ cart: [...state.cart, product] }));
  },

  /**
   * Removes an item from the cart by its product id.
   * @param {number} productId
   */
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),

  /**
   * Sets the global loading flag, used around API calls.
   * @param {boolean} isLoading
   */
  setLoading: (isLoading) => set({ isLoading }),

  /**
   * Executes a purchase for `productId` at the given `version` and
   * `quantity`, delegating to `executePurchase` in `api/productApi.js`.
   *
   * Defensive validation (Phase 10c): before any network call is made,
   * this re-checks `quantity` against the store's own authoritative
   * `stockQuantity` for the product — not just whatever the calling
   * component believed at render time. If the product can't be found, or
   * quantity is missing/non-positive/non-integer/exceeds current stock,
   * the action sets a descriptive `error` and returns immediately without
   * calling the API. This protects server resources from requests that are
   * already known to be invalid client-side, and guards against a stale
   * quantity slipping through if stock changed between the button render
   * and the click (e.g. a `useStockPolling` update landed in between).
   *
   * Also guards against re-entrant calls (a purchase already in flight is
   * not restarted), and always resets `isProcessing` to false in a
   * `finally` block regardless of success or failure.
   *
   * @param {number} productId
   * @param {number} version
   * @param {number} quantity - Requested purchase quantity; must be a
   *   positive integer not exceeding the product's current `stockQuantity`.
   * @returns {Promise<void>}
   */
  executePurchase: async (productId, version, quantity) => {
    if (get().isProcessing) {
      return;
    }

    // --- Defensive client-side validation (runs before any Axios call) ---
    const product = get().products.find((item) => item.id === productId);

    if (!product) {
      set({ error: 'This product is no longer available.' });
      return;
    }

    if (
      quantity === null ||
      quantity === undefined ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      set({ error: 'Please enter a valid quantity of at least 1.' });
      return;
    }

    if (quantity > product.stockQuantity) {
      set({
        error: `Only ${product.stockQuantity} unit${product.stockQuantity === 1 ? '' : 's'} available.`,
      });
      return;
    }
    // --- End defensive validation ---

    set({ isProcessing: true, error: null });

    try {
      const updatedProduct = await executePurchaseApi(productId, version, quantity);

      // Sync the authoritative post-purchase stock/version back into the
      // product list so StockIndicator/PurchaseButton reflect it immediately.
      set((state) => ({
        products: state.products.map((item) =>
          item.id === updatedProduct.id ? { ...item, ...updatedProduct } : item
        ),
        lastPurchaseEvent: {
          id: generateEventId(),
          status: 'success',
          message: `Purchase successful — ${quantity} unit${quantity === 1 ? '' : 's'} of ${product.name}.`,
        },
      }));
    } catch (error) {
      const status = error.isRateLimited ? 'rate_limited' : error.isConflict ? 'conflict' : 'error';
      const baseMessage = error.message || 'Purchase failed. Please try again.';

      // The axios response interceptor (see api/axiosConfig.js) has already
      // run and updated `lastCorrelationId` by the time this catch block
      // executes, so the *current* trace id here corresponds to the very
      // request that just failed — exactly the id needed for log searching.
      const correlationId = get().lastCorrelationId;
      const message = correlationId ? `${baseMessage} (Ref: ${correlationId})` : baseMessage;

      set({
        error: message,
        lastPurchaseEvent: { id: generateEventId(), status, message },
      });
    } finally {
      set({ isProcessing: false });
    }
  },
}));

// Registers this store as the sink for correlation ids echoed back by the
// backend on every axios response (see `setCorrelationIdListener` in
// `api/axiosConfig.js` for why this is a listener registration rather than
// axiosConfig importing the store directly). Done once, at module load,
// outside the `create()` call.
setCorrelationIdListener((correlationId) => {
  useFlashSaleStore.setState({ lastCorrelationId: correlationId });
});

export default useFlashSaleStore;
export { useFlashSaleStore };