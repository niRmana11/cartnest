import { Loader, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: null,
};

export default function ProductForm({
  categories,
  editingProduct,
  onSubmit,
  onCancel,
  isSaving,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: editingProduct.price || "",
        stock: editingProduct.stock || "",
        category: editingProduct.category?._id || "",
        image: null,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingProduct]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product name"
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        rows="3"
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          type="number"
          min="0"
          placeholder="Price"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
        />

        <input
          name="stock"
          value={form.stock}
          onChange={handleChange}
          type="number"
          min="0"
          placeholder="Stock"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
        />
      </div>

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        name="image"
        onChange={handleChange}
        type="file"
        accept="image/*"
        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
      />

      <button
        type="submit"
        disabled={isSaving}
        className="btn-primary inline-flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {editingProduct ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
