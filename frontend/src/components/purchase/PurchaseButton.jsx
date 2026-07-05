import { useState } from 'react';
import Button from '../common/Button';
import useFlashSaleStore from '../../store/useFlashSaleStore';

/**
 * PurchaseButton
 *
 * Triggers `addToCart` from the shared Zustand store for a given product.
 * Reads the product's live `stockQuantity` from the store (kept fresh by
 * `useStockPolling`) rather than trusting a possibly-stale prop, so the
 * button disables itself the moment stock hits zero — even if the parent
 * hasn't re-rendered with new props yet.
 *
 * @param {Object} props
 * @param {import('../../types/product').Product} props.product - The
 *   product this button adds to the cart. Used as the fallback stock value
 *   if the product isn't (yet) present in the store's product list.
 * @param {string} [props.className] - Extra classes for layout tweaks.
 * @returns {JSX.Element}
 */
function PurchaseButton({ product, className = '' }) {
  const addToCart = useFlashSaleStore((state) => state.addToCart);
  const liveStockQuantity = useFlashSaleStore(
    (state) => state.products.find((item) => item.id === product.id)?.stockQuantity
  );
  const [isAdding, setIsAdding] = useState(false);

  const stockQuantity = liveStockQuantity ?? product.stockQuantity;
  const isOutOfStock = stockQuantity <= 0;

  const handleClick = () => {
    if (isOutOfStock) {
      return;
    }
    // addToCart is a synchronous store update; the brief `isAdding` flash
    // gives the shopper visible confirmation the click registered.
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={isOutOfStock}
      isLoading={isAdding}
      className={className}
    >
      {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
    </Button>
  );
}

export default PurchaseButton;