import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getCategories } from "../api/categoryApi";
import { getCategoryIcon } from "../utils/categoryIcons";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryList = await getCategories();
        setCategories(categoryList.slice(0, 4));
      } catch (error) {
        console.error("Failed to load home categories:", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="space-y-12 py-6">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-semibold mb-6 border border-primary-100">
            <ShoppingBag className="w-4 h-4" />
            Fresh picks for every day
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Shop fresh products for your daily cart.
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            Browse fresh products by category in one clean CartNest experience
            built for fast, responsive shopping.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Login to Save Cart
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
          <div className="aspect-4/3 rounded-lg bg-primary-50 border border-primary-100 overflow-hidden">
            <img
              src="/src/assets/hero.png"
              alt="CartNest fresh shopping products"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Browse by category
            </h2>
            <p className="text-gray-600 mt-1">
              Choose a category and quickly find what you need.
            </p>
          </div>

          <Link
            to="/shop"
            className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2"
          >
            View all products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);

            return (
              <Link
                key={category._id}
                to={`/shop?category=${category.slug}`}
                className="card hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-primary-100 text-primary-700">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>

                <p className="text-sm text-gray-600">
                  Find your favorite {category.name.toLowerCase()} in one place.
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
