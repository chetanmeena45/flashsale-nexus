/**
 * Input
 *
 * Shared labeled input wrapper used across forms in the FlashSale Nexus
 * MPA (checkout, search, admin/product forms). Wraps a native <input> so
 * every field gets consistent label placement, focus styling, and error
 * presentation without repeating markup per page.
 *
 * @param {Object} props
 * @param {string} [props.label] - Optional label text rendered above the input.
 * @param {string} [props.error] - Optional error message; when present, the
 *   input is styled to indicate an invalid state and the message is shown
 *   below the field.
 * @param {string} [props.id] - Element id, used to associate the <label> and
 *   for aria-describedby on the error message. Falls back to `name` if omitted.
 * @param {string} [props.name] - Native input name attribute.
 * @param {string} [props.className] - Extra classes applied to the <input> itself.
 * @param {string} [props.wrapperClassName] - Extra classes applied to the outer wrapper.
 * @param {...*} rest - Any other native <input> attributes (type, value, onChange,
 *   placeholder, disabled, required, etc.).
 * @returns {JSX.Element}
 */
function Input({
  label,
  error,
  id,
  name,
  className = '',
  wrapperClassName = '',
  ...rest
}) {
  const inputId = id ?? name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
          transition-colors duration-150 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
          ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }
          ${className}`}
        {...rest}
      />

      {hasError && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;