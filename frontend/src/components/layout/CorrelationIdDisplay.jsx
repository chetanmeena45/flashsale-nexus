import { useState } from 'react';
import useFlashSaleStore from '../../store/useFlashSaleStore';

const COPIED_FEEDBACK_MS = 1500;

/**
 * CorrelationIdDisplay
 *
 * Shows the most recent backend-echoed `X-Correlation-ID` (see the
 * response interceptor in `api/axiosConfig.js`) as a subtle, unobtrusive
 * "Debug ID" — intended for the footer or near a purchase flow, so a
 * shopper reporting an issue (or an engineer reproducing one) can grab the
 * exact trace id for log searching across backend services.
 *
 * Renders nothing until at least one request has completed and returned a
 * correlation id, so it doesn't clutter the UI on a fresh page load.
 *
 * @param {Object} props
 * @param {string} [props.className] - Extra classes for layout tweaks.
 * @returns {JSX.Element | null}
 */
function CorrelationIdDisplay({ className = '' }) {
  const lastCorrelationId = useFlashSaleStore((state) => state.lastCorrelationId);
  const [isCopied, setIsCopied] = useState(false);

  if (!lastCorrelationId) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lastCorrelationId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard access can fail (e.g. insecure context, permissions).
      // Failing silently here is fine — the id is still visible to select
      // and copy manually, so nothing is actually broken for the user.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy debug ID"
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs text-slate-400
        transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 ${className}`}
    >
      <span>{isCopied ? 'Copied!' : `Debug ID: ${lastCorrelationId}`}</span>
    </button>
  );
}

export default CorrelationIdDisplay;