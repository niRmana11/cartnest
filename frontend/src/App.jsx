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
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import axiosInstance from "./api/axiosInstance";

function App() {
  const { checkAuth } = useAuthStore();
  const { fetchCart, localClearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Initialize Auth and Cart on App load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // check if user is still authenticated (verify JWT)
        await checkAuth(axiosInstance);
      } catch (error) {
        console.log("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, [checkAuth]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // clear cart locally when user logs out
      localClearCart();
    }
  }, [isAuthenticated, fetchCart, localClearCart]);

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster position="top-right" />

      <Routes>
        {/* PUBLIC ROUTES */}
        {/* Login page (no Layout needed) */}
        <Route path="/login" element={<LoginPage />} />

        {/* All other pages  with Layout (Navbar + Footer) */}
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* 404 PAGE */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
