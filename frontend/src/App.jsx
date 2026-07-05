import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductDetails from './pages/ProductDetails';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

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
 * @returns {JSX.Element}
 */
function App() {
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
    </BrowserRouter>
  );
}

export default App;