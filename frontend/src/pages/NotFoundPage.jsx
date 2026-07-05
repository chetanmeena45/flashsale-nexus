import { Link } from 'react-router-dom';

/**
 * NotFoundPage
 *
 * Catch-all 404 page rendered for any route that doesn't match a defined
 * path in `App.jsx`.
 *
 * @returns {JSX.Element}
 */
function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;