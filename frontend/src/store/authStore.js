import { create } from "zustand";

/**
 * Auth Store (Zustand)
 */

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  error: null,

  isAuthenticated: false,

  //  ACTIONS

  /**
   * setUser - Update user state
   */
  setUser: (userData) =>
    set({
      user: userData,
      isAuthenticated: !!userData,
      error: null,
    }),

  /**
   * setLoading - Update loading state
   */
  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * setError - Update error state
   */
  setError: (error) => set({ error }),

  /**
   * login - Handle user login
   */
  login: (userData) =>
    set({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    }),

  /**
   * logout - Clear user state
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
   */
  checkAuth: async (api) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/auth/me");
      const user = response.data.isAuthenticated ? response.data.user : null;

      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
