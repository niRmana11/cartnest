import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

function App() {
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
