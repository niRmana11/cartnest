import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

/**
 * Cart Store (Zustand)
 *
 * Global state for shopping cart
 * Handles: items, add/remove/update, total calculation, API sync
 *
 * Key Pattern: Cart state is SYNCED with backend
 * - Backend stores cart per user (MongoDB)
 * - Frontend is source of truth during session
 * - On page load, fetch cart from backend
 * - On every change, sync to backend
 */

export const useCartStore = create((set, get) => ({
  // STATE
  items: [], // Cart items with product details
  total: 0, // Total price of all items
  itemCount: 0, // Total quantity of items
  isLoading: false, // Loading during API calls
  error: null, // Error message if API fails

  //  ACTIONS

  /**
   * fetchCart - Load user's cart from backend
   *
   */
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/cart");
      const { items, total, itemCount } = response.data.cart;

      set({
        items: items || [],
        total: total || 0,
        itemCount: itemCount || 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to load cart",
      });
    }
  },

  /**
   * addToCart - Add item to cart
   *
   */
  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post("/cart", {
        productId,
        quantity,
      });

      const { cart } = response.data;
      set({
        items: cart.items || [],
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
        error: null,
      });

      return { success: true, message: "Added to cart!" };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add to cart";
      set({
        isLoading: false,
        error: errorMsg,
      });
      return { success: false, message: errorMsg };
    }
  },

  /**
   * updateItemQuantity - Update quantity of item in cart
   *
   * If quantity is 0 or negative, item is removed
   */
  updateItemQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put(`/cart/${itemId}`, {
        quantity,
      });

      const { cart } = response.data;
      set({
        items: cart.items || [],
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update cart",
      });
      return { success: false };
    }
  },

  /**
   * removeFromCart - Remove specific item from cart
   */
  removeFromCart: async (itemId) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete(`/cart/${itemId}`);

      const { cart } = response.data;
      set({
        items: cart.items || [],
        total: cart.total || 0,
        itemCount: cart.itemCount || 0,
        isLoading: false,
        error: null,
      });

      return { success: true, message: "Item removed from cart" };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to remove item",
      });
      return { success: false };
    }
  },

  /**
   * clearCart - Empty entire cart
   */
  clearCart: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete("/cart");

      const { cart } = response.data;
      set({
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
      });

      return { success: true, message: "Cart cleared" };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to clear cart",
      });
      return { success: false };
    }
  },

  /**
   * localClearCart - Clear cart locally without API call
   *
   * Used when user logs out
   */
  localClearCart: () =>
    set({
      items: [],
      total: 0,
      itemCount: 0,
      error: null,
    }),

  /**
   * setError - Update error message
   */
  setError: (error) => set({ error }),

  /**
   * clearError - Clear error message
   */
  clearError: () => set({ error: null }),
}));
