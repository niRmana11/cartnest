/**
 * ShopPage Component
 *
 * Placeholder - will be implemented in Day 4
 * Shows products by category with filtering
 */

export default function ShopPage() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop 🛍️</h1>
      <p className="text-lg text-gray-600 mb-8">
        Browse our products by category
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="card h-80 bg-gray-200 animate-pulse flex items-center justify-center"
          >
            <p className="text-gray-500">Product Placeholder {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
