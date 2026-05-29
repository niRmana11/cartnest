import { Loader, Plus, ShoppingCart } from "lucide-react";

export default function ProductCard({ product, onAddToCart, isAdding }) {
  const imageUrl = product.image?.url;
  const categoryName = product.category?.name || "Product";
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="card p-0 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      <div className="aspect-4/3 bg-gray-100 overflow-hidden rounded">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50">
            <ShoppingCart className="w-10 h-10 text-primary-300" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">
              {categoryName}
            </p>
            <h3 className="font-bold text-gray-900 leading-snug">
              {product.name}
            </h3>
          </div>

          <p className="font-bold text-primary-600 whitespace-nowrap">
            Rs. {product.price}
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">
          {product.description || "Fresh CartNest product ready for your cart."}
        </p>

        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : "bg-primary-100 text-primary-700"
            }`}
          >
            {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
          </span>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock || isAdding}
            className="btn-primary btn-sm inline-flex items-center gap-2"
          >
            {isAdding ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
