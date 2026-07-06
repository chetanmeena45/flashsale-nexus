/**
 * ProductSkeleton
 *
 * Content-aware loading placeholder for a single product card, shown in
 * the `HomePage` grid while `useFlashSaleStore.isLoading` is true. Mirrors
 * the exact structure and spacing of the live card in `HomePage.jsx`
 * (`rounded-lg border ... p-4`, title line, price line, stock line, button)
 * so swapping skeleton -> real data causes zero layout shift — the grid
 * cell keeps the same height and padding throughout.
 *
 * Uses only Tailwind's built-in `animate-pulse` utility and neutral
 * `bg-slate-200` blocks — no external skeleton library, keeping bundle
 * size unchanged.
 *
 * @param {Object} props
 * @param {boolean} [props.showImagePlaceholder=false] - Set to true once
 *   the live product card actually renders a product image, so the
 *   skeleton's image block lines up with real card dimensions. Left off
 *   by default because the current `HomePage` card has no image slot —
 *   turning this on today, before the real card has a matching image
 *   block, would itself introduce the layout shift this component exists
 *   to prevent.
 * @returns {JSX.Element}
 */
function ProductSkeleton({ showImagePlaceholder = false }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        {showImagePlaceholder && (
          <div className="mb-3 aspect-square w-full animate-pulse rounded-md bg-slate-200" />
        )}

        {/* Title line — approximates a product name's average width */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

        {/* Price line */}
        <div className="mt-2 h-7 w-1/3 animate-pulse rounded bg-slate-200" />

        {/* Stock indicator line */}
        <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Button placeholder — matches PurchaseButton's rendered height */}
      <div className="mt-4 h-9 w-full animate-pulse rounded-md bg-slate-200" />
    </div>
  );
}

export default ProductSkeleton;