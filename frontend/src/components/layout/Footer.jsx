import CorrelationIdDisplay from "./CorrelationIdDisplay";

/**
 * Footer
 *
 * Simple persistent footer shown on every page of the MPA. Also hosts
 * `CorrelationIdDisplay` (Phase 11c) — a subtle "Debug ID" for the most
 * recent request's trace id, so it's always reachable regardless of which
 * page/component last made an API call, without needing a dedicated
 * Purchase Modal to anchor it to.
 *
 * @returns {JSX.Element}
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <span>&copy; {currentYear} FlashSale Nexus. All rights reserved.</span>
        <span>Built for high-velocity flash sales.</span>
      </div>

      <div className="border-t border-slate-100 py-2 text-center">
        <CorrelationIdDisplay />
      </div>
    </footer>
  );
}

export default Footer;