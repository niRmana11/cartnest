import { ImagePlus, Loader, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

  const previewUrl = useMemo(() => {
    if (form.image) {
      return URL.createObjectURL(form.image);
    }

    return editingProduct?.image?.url || null;
  }, [form.image, editingProduct]);

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

  useEffect(() => {
    return () => {
      if (form.image && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.image, previewUrl]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const handleRemoveImage = () => {
    setForm((current) => ({
      ...current,
      image: null,
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
            className="btn-secondary btn-sm inline-flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel Edit
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
        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
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
        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400"
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Image
        </label>

        <label className="block cursor-pointer rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50 transition-colors overflow-hidden">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Product preview"
                className="w-full h-48 object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-black/55 text-white px-4 py-3">
                <p className="text-sm font-semibold">
                  {form.image ? form.image.name : "Current product image"}
                </p>
                <p className="text-xs text-gray-200">
                  Click to choose a different image
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-white border border-primary-100 flex items-center justify-center mx-auto mb-3">
                <ImagePlus className="w-6 h-6 text-primary-600" />
              </div>

              <p className="font-semibold text-gray-900">
                Click to upload product image
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WebP, or GIF up to 5MB
              </p>
            </div>
          )}

          <input
            name="image"
            onChange={handleChange}
            type="file"
            accept="image/*"
            className="sr-only"
          />
        </label>

        {form.image && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove selected image
          </button>
        )}
      </div>

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
