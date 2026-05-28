import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";
import CategoryManager from "../components/admin/CategoryManager";

export default function AdminPage() {
  const { user } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);

  const productFormRef = useRef(null);
  const categoryManagerRef = useRef(null);

  const loadCategories = async () => {
    const categoryList = await getCategories();
    setCategories(categoryList);
  };

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
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await Promise.all([loadProducts(), loadCategories()]);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // category handlers
  const handleCreateCategory = async (categoryData) => {
    try {
      setIsSaving(true);
      await createCategory(categoryData);
      toast.success("Category created");
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      setIsSaving(true);
      await updateCategory(categoryId, categoryData);
      toast.success("Category updated");
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      await deleteCategory(category._id);
      toast.success("Category deleted");
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setIsSaving(false);
    }
  };

  // product handlers
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

  const scrollToProductForm = () => {
    productFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToCategoryManager = () => {
    categoryManagerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setTimeout(() => {
      scrollToProductForm();
    }, 100);
  };

  const handleEditCategory = () => {
    setTimeout(() => {
      scrollToCategoryManager();
    }, 100);
  };

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

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div ref={productFormRef} className="h-full scroll-mt-24">
          <ProductForm
            categories={categories}
            editingProduct={editingProduct}
            onSubmit={handleSubmit}
            onCancel={() => setEditingProduct(null)}
            isSaving={isSaving}
          />
        </div>

        <div ref={categoryManagerRef} className="h-full scroll-mt-24">
          <CategoryManager
            categories={categories}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onEditStart={handleEditCategory}
            isSaving={isSaving}
          />
        </div>
      </section>

      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDelete}
        isBusy={isSaving}
      />
    </div>
  );
}
