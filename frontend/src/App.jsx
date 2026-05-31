import "./index.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPage from "./pages/PrivacyPage";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import axiosInstance from "./api/axiosInstance";

/**
 * App Component - Main routing
 */

function App() {
  const { fetchCart, localClearCart } = useCartStore();
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  // Initialize Auth & Cart on App Load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth(axiosInstance);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, [checkAuth]);

  // Fetch Cart When User Logs In
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      localClearCart();
    }
  }, [isAuthenticated, fetchCart, localClearCart]);

  if (isLoading) {
    return null;
  }

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster position="bottom-right" />

      <Routes>
        {/* PUBLIC ROUTES */}

        {/* Login page (no Layout) */}
        <Route path="/login" element={<LoginPage />} />

        {/* ALL ROUTES WITH LAYOUT */}
        <Route element={<Layout />}>
          {/* Public page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* 404 PAGE */}
        <Route path="*" element={<NotFoundPage />} />
        {/* Privacy PAGE */}
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
