import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useFlashSaleStore from '../store/useFlashSaleStore';

/**
 * Tailwind-styled color scheme per purchase outcome. Kept as a single map
 * so the "SUCCESS -> green", "429 -> orange", "409/other -> red" mapping
 * lives in exactly one place.
 */
const TOAST_STYLES = {
  success: {
    accentClass: 'border-l-4 border-green-500',
    iconClass: 'text-green-600',
    icon: '✓',
    role: 'status',
  },
  rate_limited: {
    accentClass: 'border-l-4 border-orange-500',
    iconClass: 'text-orange-600',
    icon: '⏳',
    role: 'alert',
  },
  conflict: {
    accentClass: 'border-l-4 border-red-500',
    iconClass: 'text-red-600',
    icon: '⚠',
    role: 'alert',
  },
  error: {
    accentClass: 'border-l-4 border-red-500',
    iconClass: 'text-red-600',
    icon: '✕',
    role: 'alert',
  },
};

/**
 * Renders the actual toast card markup. Kept separate from the trigger
 * logic below so styling can be iterated on independently.
 *
 * @param {Object} params
 * @param {import('react-hot-toast').Toast} params.t - The toast instance
 *   (used for the enter/exit animation class and manual dismiss).
 * @param {'success' | 'rate_limited' | 'conflict' | 'error'} params.status
 * @param {string} params.message
 * @returns {JSX.Element}
 */
function ToastCard({ t, status, message }) {
  const style = TOAST_STYLES[status] ?? TOAST_STYLES.error;

  return (
    <div
      role={style.role}
      aria-live={style.role === 'alert' ? 'assertive' : 'polite'}
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} ${style.accentClass}
        flex w-full max-w-sm items-start gap-3 rounded-md bg-white px-4 py-3 shadow-lg ring-1 ring-black/5`}
    >
      <span className={`mt-0.5 text-base font-semibold ${style.iconClass}`} aria-hidden="true">
        {style.icon}
      </span>
      <p className="flex-1 text-sm text-slate-700">{message}</p>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 transition-colors hover:text-slate-600"
      >
        &times;
      </button>
    </div>
  );
}

/**
 * usePurchaseNotifications
 *
 * Bridges `useFlashSaleStore.lastPurchaseEvent` to `react-hot-toast`,
 * translating each purchase outcome into a color-coded toast:
 *   - 'success'      -> green accent
 *   - 'rate_limited' -> orange accent (HTTP 429)
 *   - 'conflict'     -> red accent (HTTP 409 optimistic-lock failure)
 *   - 'error'        -> red accent (any other failure)
 *
 * Mount this once near the root of the app (e.g. in `App.jsx`, alongside
 * `<Toaster />`) rather than inside individual `PurchaseButton` instances —
 * a single subscription avoids firing the same toast multiple times if
 * several components happen to render for the same product.
 *
 * The effect is keyed on `lastPurchaseEvent?.id` (not on `status`/`message`
 * alone), so two consecutive attempts with an identical outcome (e.g. two
 * 429s in a row) each still produce their own toast rather than being
 * treated as "no change" by React.
 *
 * @returns {void}
 */
function usePurchaseNotifications() {
  const lastPurchaseEvent = useFlashSaleStore((state) => state.lastPurchaseEvent);

  // Prevents re-firing the same event on remount (e.g. React 18 StrictMode's
  // double-invoke in development) by remembering the last event id we
  // already turned into a toast.
  const lastHandledIdRef = useRef(null);

  useEffect(() => {
    if (!lastPurchaseEvent || lastPurchaseEvent.id === lastHandledIdRef.current) {
      return;
    }
    lastHandledIdRef.current = lastPurchaseEvent.id;

    const { status, message } = lastPurchaseEvent;

    toast.custom((t) => <ToastCard t={t} status={status} message={message} />, {
      duration: status === 'success' ? 3500 : 6000,
    });
  }, [lastPurchaseEvent]);
}

export default usePurchaseNotifications;