import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';
import useFlashSaleStore from '../store/useFlashSaleStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StockIndicator from '../components/purchase/StockIndicator';
import PurchaseButton from '../components/purchase/PurchaseButton';

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
 * @returns {JSX.Element}
 */
function HomePage() {
  const products = useFlashSaleStore((state) => state.products);
  const setProducts = useFlashSaleStore((state) => state.setProducts);
  const isLoading = useFlashSaleStore((state) => state.isLoading);
  const setLoading = useFlashSaleStore((state) => state.setLoading);
  const [loadError, setLoadError] = useState(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" label="Loading products" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  if (products.length === 0) {
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
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
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