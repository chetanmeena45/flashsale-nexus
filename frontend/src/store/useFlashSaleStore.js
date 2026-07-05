import { create } from 'zustand';

// eslint-disable-next-line no-unused-vars -- imported for JSDoc @typedef reference
import Product from '../types/product';

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
}));

export default useFlashSaleStore;
export { useFlashSaleStore };