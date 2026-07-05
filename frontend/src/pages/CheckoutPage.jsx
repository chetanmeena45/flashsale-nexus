import { Link } from 'react-router-dom';
import useFlashSaleStore from '../store/useFlashSaleStore';
import Button from '../components/common/Button';

/**
 * CheckoutPage
 *
 * Displays the shopper's current cart ("/checkout") sourced entirely from
 * `useFlashSaleStore`, with a per-item remove action and a running total.
 * Actual payment/order-submission integration is left as a follow-up once
 * the order API contract is defined.
 *
 * @returns {JSX.Element}
 */
function CheckoutPage() {
  const cart = useFlashSaleStore((state) => state.cart);
  const removeFromCart = useFlashSaleStore((state) => state.removeFromCart);

  const total = cart.reduce((sum, item) => sum + Number(item.price ?? 0), 0);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Browse the flash sale
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">${Number(item.price).toFixed(2)}</p>
            </div>
            <Button variant="secondary" onClick={() => removeFromCart(item.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-lg font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold text-slate-900">${total.toFixed(2)}</span>
      </div>

      <div className="mt-6">
        <Button variant="primary" className="w-full">
          Place Order
        </Button>
      </div>
    </div>
  );
}

export default CheckoutPage;