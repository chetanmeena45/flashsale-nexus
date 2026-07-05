import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import useStockPolling from '../hooks/useStockPolling';
import useFlashSaleStore from '../store/useFlashSaleStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StockIndicator from '../components/purchase/StockIndicator';
import PurchaseButton from '../components/purchase/PurchaseButton';

/**
 * ProductDetails
 *
 * Detail page for a single product ("/product/:id"). Fetches the product
 * on mount, seeds it into `useFlashSaleStore`, and then hands off to
 * `useStockPolling` to keep `stockQuantity` fresh every 5 seconds for the
 * remainder of the page's lifetime — critical for flash sales where stock
 * can disappear while a shopper is reading the description.
 *
 * @returns {JSX.Element}
 */
function ProductDetails() {
  const { id } = useParams();
  const productId = Number(id);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const products = useFlashSaleStore((state) => state.products);
  const setProducts = useFlashSaleStore((state) => state.setProducts);
  const product = products.find((item) => item.id === productId);

  // Seed the product into the store if it isn't already there (e.g. the
  // shopper navigated directly to this URL instead of via the HomePage grid).
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsInitialLoading(true);
      setLoadError(null);
      try {
        const data = await getProductById(productId);
        if (!isMounted) return;

        const { products: currentProducts, setProducts: updateProducts } = useFlashSaleStore.getState();
        const alreadyPresent = currentProducts.some((item) => item.id === data.id);
        updateProducts(
          alreadyPresent
            ? currentProducts.map((item) => (item.id === data.id ? { ...item, ...data } : item))
            : [...currentProducts, data]
        );
      } catch (error) {
        if (isMounted) {
          setLoadError('Unable to load this product. It may no longer be available.');
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    }

    if (Number.isFinite(productId)) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per productId
  }, [productId]);

  // Keep stock fresh every 5 seconds while this page is mounted.
  useStockPolling(productId, { enabled: Number.isFinite(productId) });

  if (isInitialLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" label="Loading product" />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-red-600">
        {loadError ?? 'Product not found.'}
        <div className="mt-4">
          <Link to="/" className="text-indigo-600 hover:underline">
            Back to all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-block text-sm text-indigo-600 hover:underline">
        &larr; Back to all products
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          ${Number(product.price).toFixed(2)}
        </p>

        <div className="mt-3">
          <StockIndicator stockQuantity={product.stockQuantity} />
        </div>

        <div className="mt-6">
          <PurchaseButton product={product} />
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;