import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import useFlashSaleStore from '../store/useFlashSaleStore';
import StockIndicator from '../components/purchase/StockIndicator';
import PurchaseButton from '../components/purchase/PurchaseButton';
import ProductSkeleton from '../components/product/ProductSkeleton';

/** Number of skeleton cards shown while the catalog is loading. Matches a
 * typical first-page product count so the loading grid's proportions look
 * like a plausible real page rather than an obviously-fake placeholder. */
const SKELETON_COUNT = 6;

/**
 * HomePage
 *
 * Landing page ("/") of the MPA. Fetches the product catalog once on mount
 * via `productApi.getProducts()`, hydrates the shared `useFlashSaleStore`
 * with the result, and renders a responsive grid of product cards. Each
 * card links through to `/product/:id` for details and exposes a
 * `PurchaseButton` / `StockIndicator` pair for quick add-to-cart directly
 * from the listing.
 *
 * While `isLoading` is true, the grid renders `ProductSkeleton` placeholders
 * instead of a blocking full-page spinner (Phase 11b) — the page header and
 * layout stay visible immediately, and only the card content area shows the
 * shimmering placeholder, so the UI feels responsive even under slow/loaded
 * backend conditions. Once real data arrives, cards fade in via a CSS
 * opacity transition rather than popping in abruptly.
 *
 * @returns {JSX.Element}
 */
function HomePage() {
  const products = useFlashSaleStore((state) => state.products);
  const setProducts = useFlashSaleStore((state) => state.setProducts);
  const isLoading = useFlashSaleStore((state) => state.isLoading);
  const setLoading = useFlashSaleStore((state) => state.setLoading);
  const [loadError, setLoadError] = useState(null);

  // Drives the fade-in transition: stays false until one animation frame
  // after real data is ready, so the browser has a "from" (opacity-0) state
  // to transition from rather than mounting already at full opacity.
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError('Unable to load products right now. Please try again shortly.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (isLoading || loadError || products.length === 0) {
      setShowProducts(false);
      return undefined;
    }
    // Deferring to the next animation frame gives the browser a committed
    // opacity-0 paint first, so the subsequent opacity-100 class change is
    // an actual transition rather than an instant, un-animated snap.
    const frameId = requestAnimationFrame(() => setShowProducts(true));
    return () => cancelAnimationFrame(frameId);
  }, [isLoading, loadError, products.length]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-slate-500">
        No products available right now. Check back soon for the next drop.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Current Flash Sale</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))
          : products.map((product) => (
              <div
                key={product.id}
                className={`flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4
                  shadow-sm transition-[opacity,box-shadow] duration-300 ease-out hover:shadow-md
                  ${showProducts ? 'opacity-100' : 'opacity-0'}`}
              >
                <div>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <div className="mt-2">
                    <StockIndicator stockQuantity={product.stockQuantity} />
                  </div>
                </div>

                <div className="mt-4">
                  <PurchaseButton product={product} className="w-full" />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default HomePage;