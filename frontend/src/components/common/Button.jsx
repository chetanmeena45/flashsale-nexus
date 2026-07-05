import LoadingSpinner from './LoadingSpinner';

/**
 * Visual style variants for Button.
 * - primary: main call-to-action (e.g. "Add to Cart", "Checkout").
 * - secondary: lower-emphasis action (e.g. "Cancel", "View Details").
 * - danger: destructive/irreversible action (e.g. "Remove from Cart").
 */
const VARIANT_CLASSES = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-indigo-600 disabled:bg-indigo-300',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-slate-400 disabled:text-slate-400 disabled:bg-slate-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600 disabled:bg-red-300',
};

/**
 * Button
 *
 * Shared button primitive used across the FlashSale Nexus MPA (product
 * cards, cart drawer, checkout page, forms). Centralizes variant styling,
 * disabled/loading states, and transitions so every page gets consistent
 * interaction feedback.
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - Visual style.
 * @param {boolean} [props.isLoading=false] - Shows a spinner and disables interaction
 *   while an async action (e.g. add-to-cart API call) is in flight.
 * @param {boolean} [props.disabled=false] - Disables the button.
 * @param {React.ReactNode} props.children - Button label/content.
 * @param {string} [props.className] - Extra classes for one-off layout tweaks.
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Native button type.
 * @param {...*} rest - Any other native <button> attributes (onClick, aria-*, etc.).
 * @returns {JSX.Element}
 */
function Button({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || isLoading;
  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium
        transition-colors duration-150 ease-in-out
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:cursor-not-allowed disabled:opacity-70
        ${variantClasses} ${className}`}
      {...rest}
    >
      {isLoading && <LoadingSpinner size="xs" />}
      <span>{children}</span>
    </button>
  );
}

export default Button;