import { useEffect, useRef } from 'react';
import { getProductById } from '../api/productApi';
import useFlashSaleStore from '../store/useFlashSaleStore';

const DEFAULT_POLL_INTERVAL_MS = 5000;

/**
 * useStockPolling
 *
 * Polls `productApi.getProductById(productId)` on a fixed interval to pick
 * up live `stockQuantity` changes during a flash sale (where stock can be
 * decremented by other shoppers at any moment), and syncs the result into
 * the shared `useFlashSaleStore` product list so every component reading
 * from the store (StockIndicator, PurchaseButton, product cards, etc.)
 * stays in sync without each one polling independently.
 *
 * The interval is cleared on unmount and whenever `productId` changes, to
 * avoid leaking timers or polling a stale product id.
 *
 * @param {number} productId - The id of the product to poll.
 * @param {Object} [options]
 * @param {number} [options.intervalMs=5000] - Polling interval in milliseconds.
 * @param {boolean} [options.enabled=true] - Set to false to pause polling
 *   (e.g. once the product page unmounts or the item is sold out).
 * @returns {void}
 */
function useStockPolling(productId, { intervalMs = DEFAULT_POLL_INTERVAL_MS, enabled = true } = {}) {
  // Tracks whether a request is already in flight so a slow response can't
  // overlap with the next tick if the network is briefly slow.
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!productId || !enabled) {
      return undefined;
    }

    const pollStock = async () => {
      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;

      try {
        const latestProduct = await getProductById(productId);

        // Merge the freshly-polled stock fields into the existing product
        // list in the store, rather than replacing the whole list, so
        // unrelated product data (and any other in-flight edits) is preserved.
        const { products, setProducts } = useFlashSaleStore.getState();
        const updatedProducts = products.map((product) =>
          product.id === productId
            ? {
                ...product,
                stock: latestProduct.stock,
                stockQuantity: latestProduct.stockQuantity,
                version: latestProduct.version,
              }
            : product
        );
        setProducts(updatedProducts);
      } catch (error) {
        // Rate limiting (429) is expected under flash-sale load; skip this
        // tick and let the next interval retry rather than surfacing an error.
        if (error?.isRateLimited) {
          // eslint-disable-next-line no-console
          console.warn(`[useStockPolling] Rate limited while polling product ${productId}, will retry.`);
        } else {
          // eslint-disable-next-line no-console
          console.error(`[useStockPolling] Failed to poll stock for product ${productId}:`, error);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Fetch immediately on mount so the UI doesn't wait a full interval
    // for the first update, then continue polling on a fixed cadence.
    pollStock();
    const intervalId = setInterval(pollStock, intervalMs);

    return () => clearInterval(intervalId);
  }, [productId, intervalMs, enabled]);
}

export default useStockPolling;