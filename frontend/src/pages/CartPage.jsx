import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, PackageSearch, Receipt, X } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/cart/CartItem";
import CartTotal from "../components/cart/CartTotal";
import { useCartStore } from "../store/cartStore";

export default function CartPage() {
  const {
    items,
    total,
    itemCount,
    isLoading,
    error,
    fetchCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleIncrease = async (productId, currentQuantity) => {
    setUpdatingItemId(productId);

    const result = await updateItemQuantity(productId, currentQuantity + 1);

    if (!result.success) {
      toast.error("Failed to update quantity");
    }

    setUpdatingItemId(null);
  };

  const handleDecrease = async (productId, currentQuantity) => {
    setUpdatingItemId(productId);

    const result = await updateItemQuantity(productId, currentQuantity - 1);

    if (result.success) {
      if (currentQuantity === 1) {
        toast.success("Item removed from cart");
      }
    } else {
      toast.error("Failed to update quantity");
    }

    setUpdatingItemId(null);
  };

  const handleRemove = async (productId) => {
    setUpdatingItemId(productId);

    const result = await removeFromCart(productId);

    if (result.success) {
      toast.success(result.message || "Item removed from cart");
    } else {
      toast.error("Failed to remove item");
    }

    setUpdatingItemId(null);
  };

  const handleClearCart = async () => {
    const shouldClear = window.confirm(
      "Are you sure you want to remove all items from your cart?",
    );

    if (!shouldClear) return;

    const result = await clearCart();

    if (result.success) {
      toast.success(result.message || "Cart cleared");
      setShowOrderSummary(false);
    } else {
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    setShowOrderSummary(true);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="py-8 space-y-6">
        <div>
          <div className="h-10 w-56 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card h-32 animate-pulse bg-gray-100" />
            ))}
          </div>

          <div className="card h-72 animate-pulse bg-gray-100" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12">
        <div className="text-center max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-lg bg-primary-50 flex items-center justify-center mb-5">
            <PackageSearch className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Add products from the shop to review them here before checkout.
          </p>

          <Link to="/shop" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <section>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Shopping Cart</h1>
        <p className="text-lg text-gray-600">
          Review your items, update quantities, and check your order summary.
        </p>
      </section>

      {error && (
        <div className="card border border-red-100 bg-red-50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-800">Cart notice</h2>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const productId = item.product?._id;

            return (
              <CartItem
                key={productId}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                isUpdating={updatingItemId === productId || isLoading}
              />
            );
          })}
        </div>

        <CartTotal
          total={total}
          itemCount={itemCount}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isUpdating={isLoading}
        />
      </section>

      {showOrderSummary && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary-700" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <p className="text-sm text-gray-500">
                    Payment integration is future scope.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowOrderSummary(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close order summary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product?._id}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.product?.name || "Unavailable product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x Rs. {item.priceAtTime}
                    </p>
                  </div>

                  <p className="font-bold text-gray-900 whitespace-nowrap">
                    Rs. {item.quantity * item.priceAtTime}
                  </p>
                </div>
              ))}

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{itemCount}</span>
                </div>

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
                className="w-full btn-primary opacity-60 cursor-not-allowed"
              >
                Pay Now - Future Scope
              </button>

              <p className="text-xs text-gray-500 text-center">
                This screen prepares the checkout flow. Payment gateway
                integration will be added in a future enhancement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
