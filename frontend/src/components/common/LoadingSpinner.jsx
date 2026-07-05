/**
 * LoadingSpinner
 *
 * A lightweight, dependency-free CSS spinner (Tailwind `animate-spin` +
 * a partial border-color trick) used to indicate in-flight API calls
 * across the app — e.g. inside `Button` (`isLoading`), on the product
 * grid while `isLoading` is true in the store, or standalone on a page.
 *
 * @param {Object} props
 * @param {'xs' | 'sm' | 'md' | 'lg'} [props.size='md'] - Controls spinner diameter.
 * @param {string} [props.className] - Extra classes for positioning/margins.
 * @param {string} [props.label='Loading'] - Accessible label for screen readers.
 * @returns {JSX.Element}
 */
function LoadingSpinner({ size = 'md', className = '', label = 'Loading' }) {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]',
  };

  const dimensionClasses = sizeClasses[size] ?? sizeClasses.md;

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className={`${dimensionClasses} animate-spin rounded-full border-slate-200 border-t-indigo-600`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default LoadingSpinner;