import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
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

        // if authenticated, fetch their cart from backend
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
        {/* Login page (no Layout needed) */}
        <Route path="/login" element={<LoginPage />} />

        {/* All other pages wrapped with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          {/* TODO: Add more routes */}
          {/* <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminDashboard />} /> */}
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
