import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, Loader, ShieldCheck } from "lucide-react";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../api/adminApi";
import AdminStats from "../components/admin/AdminStats";
import ProductForm from "../components/admin/ProductForm";
import ProductTable from "../components/admin/ProductTable";
import { useAuthStore } from "../store/authStore";

export default function AdminPage() {
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const categories = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      if (product.category?._id) {
        map.set(product.category._id, product.category);
      }
    });

    return Array.from(map.values());
  }, [products]);

  const categorySummary = useMemo(() => {
    return categories.map((category) => {
      const count = products.filter(
        (product) => product.category?._id === category._id,
      ).length;

      return {
        ...category,
        count,
      };
    });
  }, [categories, products]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const productList = await getAdminProducts();
      setProducts(productList);
    } catch (err) {
      console.error("Failed to load admin products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);

      if (editingProduct) {
        await updateAdminProduct(editingProduct._id, formData);
        toast.success("Product updated");
      } else {
        await createAdminProduct(formData);
        toast.success("Product created");
      }

      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error("Save product failed:", err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      await deleteAdminProduct(product._id);
      toast.success("Product deleted");
      await loadProducts();
    } catch (err) {
      console.error("Delete product failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have admin permissions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Loader className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-semibold mb-4 border border-primary-100">
            <ShieldCheck className="w-4 h-4" />
            Admin Dashboard
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Manage CartNest products
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl">
            Add, edit, and remove products shown in the customer shop.
          </p>
        </div>
      </section>

      {error && (
        <div className="card border border-red-100 bg-red-50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-800">Admin notice</h2>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <AdminStats products={products} categories={categories} />

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-1">
          <ProductForm
            categories={categories}
            editingProduct={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => setEditingProduct(null)}
            isSaving={isSaving}
          />

          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Category Summary
            </h2>

            <div className="space-y-3">
              {categorySummary.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500">{category.slug}</p>
                  </div>

                  <span className="text-sm font-bold text-primary-600">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Full category CRUD needs backend category routes. This summary
              uses categories returned with products.
            </p>
          </div>
        </div>

        <div className="xl:col-span-2">
          <ProductTable
            products={products}
            onEdit={setEditingProduct}
            onDelete={handleDelete}
            isBusy={isSaving}
          />
        </div>
      </section>
    </div>
  );
}
