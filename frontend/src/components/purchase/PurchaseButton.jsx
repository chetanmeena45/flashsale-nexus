import { useState } from 'react';
import Button from '../common/Button';
import useFlashSaleStore from '../../store/useFlashSaleStore';

/**
 * Parses a raw quantity input string and validates it against the current
 * available stock. Centralized here so the same rule is used for both the
 * disabled-state calculation and any inline helper/error text.
 *
 * @param {string} rawQuantity - The raw input value (kept as a string so an
 *   empty field can be distinguished from `0`).
 * @param {number} stockQuantity - Current available stock for the product.
 * @returns {{ quantity: number | null, isValid: boolean, reason: string | null }}
 */
function validateQuantity(rawQuantity, stockQuantity) {
  if (rawQuantity === '') {
    return { quantity: null, isValid: false, reason: null };
  }

  const quantity = Number(rawQuantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { quantity, isValid: false, reason: 'Enter a quantity of at least 1.' };
  }

  if (quantity > stockQuantity) {
    return {
      quantity,
      isValid: false,
      reason: `Only ${stockQuantity} unit${stockQuantity === 1 ? '' : 's'} available.`,
    };
  }

  return { quantity, isValid: true, reason: null };
}

/**
 * PurchaseButton
 *
 * Executes an immediate purchase via `useFlashSaleStore.executePurchase`,
 * which submits the product's current `version` (for backend optimistic
 * locking) and the requested `quantity`.
 *
 * Quantity is strictly validated against the *live* `stockQuantity` read
 * from `useFlashSaleStore` (not a static prop), so if stock changes
 * elsewhere in the app — e.g. `useStockPolling` picks up a decrement from
 * another shopper — this component re-renders automatically via Zustand's
 * subscription model and re-validates immediately: an already-entered
 * quantity that's no longer purchasable disables the button on its own,
 * with no manual re-check required.
 *
 * The button is disabled whenever: the quantity field is empty, the
 * quantity is <= 0, the quantity exceeds current stock, a purchase is
 * already in flight (`isProcessing`), or the product is out of stock.
 *
 * @param {Object} props
 * @param {import('../../types/product').Product} props.product - The
 *   product to purchase. Falls back to `product.stockQuantity`/`version`
 *   if the product isn't (yet) present in the store's product list.
 * @param {string} [props.className] - Extra classes for layout tweaks.
 * @returns {JSX.Element}
 */
function PurchaseButton({ product, className = '' }) {
  const isProcessing = useFlashSaleStore((state) => state.isProcessing);
  const error = useFlashSaleStore((state) => state.error);
  const executePurchase = useFlashSaleStore((state) => state.executePurchase);

  // Selecting the live product slice (not just `stockQuantity`) means this
  // component re-renders whenever *anything* about the product changes in
  // the store (stock, version, etc.) — the core of the "UI synchronization"
  // requirement: no external polling/refresh call needed from this component,
  // Zustand's subscription does it automatically.
  const liveProduct = useFlashSaleStore((state) =>
    state.products.find((item) => item.id === product.id)
  );

  const stockQuantity = liveProduct?.stockQuantity ?? product.stockQuantity;
  const version = liveProduct?.version ?? product.version;
  const isOutOfStock = stockQuantity <= 0;

  // Quantity is kept as a string in local state so an empty field is
  // distinguishable from an explicit 0 for validation purposes.
  const [rawQuantity, setRawQuantity] = useState('1');
  const { quantity, isValid: isQuantityValid, reason: quantityError } = validateQuantity(
    rawQuantity,
    stockQuantity
  );

  const isDisabled = isOutOfStock || isProcessing || !isQuantityValid;

  const handleQuantityChange = (event) => {
    // Allow only digits (or an empty field while the user is typing/clearing).
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setRawQuantity(value);
    }
  };

  const handleClick = () => {
    if (isDisabled) {
      return;
    }
    executePurchase(product.id, version, quantity);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {!isOutOfStock && (
        <div className="flex flex-col gap-1">
          <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input
            id={`quantity-${product.id}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={stockQuantity}
            value={rawQuantity}
            onChange={handleQuantityChange}
            disabled={isProcessing}
            aria-invalid={Boolean(quantityError)}
            aria-describedby={`quantity-help-${product.id}`}
            className={`w-24 rounded-md border px-3 py-2 text-sm text-slate-900
              transition-colors duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
              ${
                quantityError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
          />
          <p
            id={`quantity-help-${product.id}`}
            className={`text-xs ${quantityError ? 'text-red-600' : 'text-slate-500'}`}
          >
            {quantityError ?? `Available stock: ${stockQuantity}`}
          </p>
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleClick}
        disabled={isDisabled}
        isLoading={isProcessing}
        className="disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isOutOfStock ? 'Sold Out' : isProcessing ? 'Processing...' : 'Buy Now'}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default PurchaseButton;