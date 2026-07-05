/**
 * StockIndicator
 *
 * Displays the current stock level for a product, color-coded so shoppers
 * can gauge urgency at a glance during a flash sale: green for healthy
 * stock, red once it drops below `lowStockThreshold`. Intended to sit next
 * to `PurchaseButton` and be driven by the same store data kept fresh by
 * `useStockPolling`.
 *
 * @param {Object} props
 * @param {number} props.stockQuantity - Current available stock count.
 * @param {number} [props.lowStockThreshold=5] - Threshold below which stock
 *   is considered low and rendered in red.
 * @param {string} [props.className] - Extra classes for layout tweaks.
 * @returns {JSX.Element}
 */
function StockIndicator({ stockQuantity, lowStockThreshold = 5, className = '' }) {
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = !isOutOfStock && stockQuantity < lowStockThreshold;

  const colorClasses = isOutOfStock || isLowStock ? 'text-red-600' : 'text-green-600';

  const label = isOutOfStock ? 'Out of stock' : `${stockQuantity} in stock`;

  return (
    <span
      role="status"
      className={`text-sm font-medium ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}

export default StockIndicator;