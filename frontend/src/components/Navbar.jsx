import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, User } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

/**
 * Navbar Component
 *
 * Features:
 * - CartNest logo + branding
 * - Cart icon with item count badge
 * - User menu dropdown (when logged in)
 * - Mobile hamburger menu
 * - Navigation links
 * - Responsive design (desktop nav, mobile hamburger)
 *
 */

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Get auth state from Zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  // Get cart item count from Zustand store
  const { itemCount: cartItemCount } = useCartStore();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ===== LEFT: Logo + Brand ===== */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* Logo Icon */}
            <div className="p-2 bg-primary-500 rounded-lg shadow-md">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>

            {/* Brand Name */}
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl text-primary-600">
                CartNest
              </span>
              <span className="text-xs text-gray-500">Fresh Shopping</span>
            </div>

            {/* Mobile: Just show CartNest */}
            <span className="sm:hidden font-bold text-xl text-primary-600">
              CartNest
            </span>
          </Link>

          {/* ===== CENTER: Navigation Links (Desktop Only) ===== */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Cart
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* ===== RIGHT: Cart Badge + User Menu ===== */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />

              {/* Badge showing item count */}
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu or Login Button */}
            {isAuthenticated ? (
              // ===== LOGGED IN: User Dropdown Menu =====
              <div className="relative">
                {/* User Avatar Button */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {/* User Icon */}
                  <div className="p-2 bg-primary-100 rounded-full">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>

                  {/* User Name (Desktop) */}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-medium text-gray-800">{user?.name}</p>
                      {/* Only show email if it's a real one (not generated) */}
                      {!user?.email?.includes("cartnest.local") && (
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      )}
                      <p className="text-xs text-primary-600 font-semibold capitalize mt-1">
                        {user?.role}
                      </p>
                    </div>

                    {/* Menu Items */}
                    {user?.role === "admin" && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                        <hr className="my-1" />
                      </>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ===== NOT LOGGED IN: Login Button =====
              <Link
                to="/login"
                className="btn-primary btn-sm hidden sm:inline-block"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU (Hidden on Desktop) ===== */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Admin
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block btn-primary"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
