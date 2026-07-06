import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductDetails from './pages/ProductDetails';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import usePurchaseNotifications from './hooks/usePurchaseNotifications';

/**
 * App
 *
 * Root component for the FlashSale Nexus MPA. Wraps every route with the
 * persistent `Navbar` and `Footer`, and defines the top-level route table:
 *   - "/"            -> HomePage (product catalog)
 *   - "/product/:id" -> ProductDetails
 *   - "/checkout"    -> CheckoutPage
 *   - "*"            -> NotFoundPage (catch-all)
 *
 * The layout uses a min-h-screen flex column so the footer sticks to the
 * bottom of the viewport even on short pages.
 *
 * `usePurchaseNotifications` is mounted once here (not per `PurchaseButton`)
 * so every purchase attempt — from any page — produces exactly one toast,
 * rendered by the single top-level `<Toaster />`. The toaster is anchored
 * `top-right` with a top offset so it never overlaps the sticky `Navbar`
 * or any in-page `PurchaseButton`, regardless of scroll position.
 *
 * @returns {JSX.Element}
 */
function App() {
  usePurchaseNotifications();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>

      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ top: 76 }}
        toastOptions={{ className: '!bg-transparent !p-0 !shadow-none' }}
      />
    </BrowserRouter>
  );
}

export default App;