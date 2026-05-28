import { Loader, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartTotal({
  total,
  itemCount,
  onClearCart,
  isUpdating,
}) {
  return (
    <aside className="card h-fit">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-primary-700" />
        </div>

        <div>
          <h2 className="font-bold text-gray-900">Order Summary</h2>
          <p className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-5">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>Rs. {total}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>Calculated later</span>
        </div>

        <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-4">
          <span>Total</span>
          <span className="text-primary-600">Rs. {total}</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="w-full mt-6 btn-primary opacity-60 cursor-not-allowed"
      >
        Checkout Coming Soon
      </button>

      <Link
        to="/shop"
        className="w-full mt-3 btn-secondary inline-flex justify-center"
      >
        Continue Shopping
      </Link>

      <button
        type="button"
        onClick={onClearCart}
        disabled={isUpdating || itemCount === 0}
        className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        Clear Cart
      </button>
    </aside>
  );
}
