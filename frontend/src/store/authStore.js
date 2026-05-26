import { create } from "zustand";

/**
 * Auth Store (Zustand)
 *
 * Global state for authentication
 * Handles: user data, login/logout, loading states
 *
 * Why Zustand? Simpler than Redux, perfect for small-medium apps
 * No boilerplate, just write JavaScript objects
 */

export const useAuthStore = create((set) => ({
  // state
  user: null,
  isLoading: false,
  error: null,

  // Computed state(helpers)
  isAuthenticated: false,

  //  ACTIONS

  /**
   * setUser - Update user state
   * Called after successful login
   */
  setUser: (userData) =>
    set((state) => ({
      user: userData,
      isAuthenticated: !!userData, // true if userData exists, false if null
      error: null,
    })),

  /**
   * setLoading - Update loading state
   * Called during login/logout operations
   */
  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * setError - Update error state
   * Called when auth fails
   */
  setError: (error) => set({ error }),

  /**
   * login - Handle user login
   *
   * This is called from LoginPage after OAuth/Passkey succeeds
   * In the actual implementation, we'd call backend API here
   * For now, we'll set it up to accept user data from OAuth callback
   */
  login: (userData) =>
    set((state) => ({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })),

  /**
   * logout - Clear user state
   *
   * Called when user clicks logout
   * Clears JWT cookie on backend
   */
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  /**
   * checkAuth - Verify user is still authenticated
   *
   * Called on app load to check if JWT cookie exists
   * and is valid. If not, user is logged out.
   *
   * This prevents logged-in state from persisting after logout
   */
  checkAuth: async (api) => {
    set({ isLoading: true });
    try {
      // Call backend /api/auth/me endpoint
      // If successful: user is authenticated
      // If failed: user is not authenticated
      const response = await api.get("/auth/me");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // JWT invalid or expired
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
