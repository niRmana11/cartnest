import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { getProducts } from "../api/productApi";
import CategoryFilter from "../components/products/CategoryFilter";
import ProductGrid from "../components/products/ProductGrid";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getCategories } from "../api/categoryApi";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);

  const loadProducts = async (categorySlug = selectedCategory) => {
    try {
      setIsProductsLoading(true);
      setError(null);

      const productList = await getProducts(categorySlug);
      setProducts(productList);
    } catch (err) {
      console.error("Failed to load products:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load products. Please try again.";

      setError(message);
      setProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await getCategories();
      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);

    if (categorySlug === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categorySlug });
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login before adding items to your cart.");
      return;
    }

    try {
      setAddingProductId(product._id);

      const result = await addToCart(product._id, 1);

      if (result.success) {
        toast.success(`${product.name} added to cart`);
      } else {
        toast.error(result.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Add to cart failed:", err);

      const status = err.response?.status;
      if (status === 401) {
        toast.error("Please login before adding items to your cart.");
      } else {
        toast.error("Failed to add item to cart");
      }
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-semibold mb-4 border border-primary-100">
            <ShoppingBag className="w-4 h-4" />
            CartNest Shop
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Browse fresh products
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl">
            Filter by category, choose your favorites, and add products to your
            cart in one click.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {error ? (
          <div className="card border border-red-100 bg-red-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-red-800">
                    Could not load products
                  </h2>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadProducts(selectedCategory)}
                className="btn-secondary btn-sm inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid
            products={products}
            isLoading={isProductsLoading}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
          />
        )}
      </section>
    </div>
  );
}
