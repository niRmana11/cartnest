import { PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";

function ProductSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="aspect-4/3 bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  onAddToCart,
  addingProductId,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <ProductSkeleton key={item} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card text-center py-14">
        <div className="w-14 h-14 mx-auto rounded-lg bg-primary-50 flex items-center justify-center mb-4">
          <PackageSearch className="w-7 h-7 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Try another category or check again after products are added.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          isAdding={addingProductId === product._id}
        />
      ))}
    </div>
  );
}
