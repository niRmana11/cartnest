/**
 * CartPage Component
 *
 * Placeholder - will be implemented in Day 5
 * Shows shopping cart items with checkout button
 */

export default function CartPage() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Shopping Cart 🛒
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Review your items before checkout
      </p>
      <div className="card p-8 text-center bg-gray-50">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <p className="text-sm text-gray-500">
          Add items from the shop to get started!
        </p>
      </div>
    </div>
  );
}
