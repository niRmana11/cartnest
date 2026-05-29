import { Edit, Trash2 } from "lucide-react";

export default function ProductTable({ products, onEdit, onDelete, isBusy }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            Manage active products shown in the shop.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-sm text-gray-500">
              <th className="py-3 pr-4 w-[50%]">Product</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {product.image?.url && (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 pr-4 text-sm text-gray-600">
                  {product.category?.name || "Uncategorized"}
                </td>

                <td className="py-4 pr-4 font-semibold text-primary-600">
                  Rs. {product.price}
                </td>

                <td className="py-4 pr-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      product.stock > 0
                        ? "bg-primary-50 text-primary-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>

                <td className="py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      disabled={isBusy}
                      className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      disabled={isBusy}
                      className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
