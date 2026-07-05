import { Link } from 'react-router-dom';
import useFlashSaleStore from '../../store/useFlashSaleStore';

/**
 * Navbar
 *
 * Persistent top navigation shown on every page of the MPA. Displays a
 * logo placeholder linking home and a live cart count badge sourced
 * directly from `useFlashSaleStore`, so it updates instantly whenever
 * `addToCart` / `removeFromCart` run anywhere in the app.
 *
 * @returns {JSX.Element}
 */
function Navbar() {
  const cartCount = useFlashSaleStore((state) => state.cart.length);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm text-white">
            FS
          </span>
          <span className="hidden sm:inline">FlashSale Nexus</span>
        </Link>

        <Link
          to="/checkout"
          className="relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
        >
          <span>Cart</span>
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
            {cartCount}
          </span>
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;