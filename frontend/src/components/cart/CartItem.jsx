import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  isUpdating,
}) {
  const product = item.product;
  const productId = product?._id;
  const imageUrl = product?.image?.url;
  const itemTotal = item.quantity * item.priceAtTime;
  const isMaxQuantity = product?.stock ? item.quantity >= product.stock : false;

  return (
    <article className="card p-4">
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product?.name || "Cart item"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900 truncate">
                {product?.name || "Unavailable product"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Rs. {item.priceAtTime} each
              </p>

              {product?.stock !== undefined && (
                <p className="text-xs text-primary-700 mt-1">
                  {product.stock} in stock
                </p>
              )}
            </div>

            <p className="font-bold text-primary-600 whitespace-nowrap">
              Rs. {itemTotal}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-5">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => onDecrease(productId, item.quantity)}
                disabled={isUpdating}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center text-sm font-semibold">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => onIncrease(productId, item.quantity)}
                disabled={isUpdating || isMaxQuantity}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(productId)}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
