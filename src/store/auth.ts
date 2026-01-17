import { getSsoConfig } from "@/lib/config/env";
import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAccessToken: (token) => {
    set({
      accessToken: token,
      isAuthenticated: !!token,
    });
    if (token) {
      get().fetchUser();
    }
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  logout: () => {
    // Clear cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    // Clear state
    get().clearAuth();
  },

  refresh: async () => {
    try {
      const { url: SSO_URL, apiKey: API_KEY } = getSsoConfig();

      // Direct call to Service (Cross-Origin)
      const response = await fetch(`${SSO_URL}/auth/refresh`, {
        method: "GET", // Service endpoint is GET
        headers: {
          Accept: "application/json",
          "X-API-Key": API_KEY,
        },
        credentials: "include", // Sends the SameSite=None cookie
      });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { data: { access_token: "..." } } structure
        // Need to parse correctly based on SuccessResponseDTO
        const token = data.data?.access_token || data.access_token;

        if (token) {
          set({
            accessToken: token,
            isAuthenticated: true,
          });
          // Fetch user after refresh
          await get().fetchUser();
        }
      } else {
        // If refresh fails (e.g., 401), clear auth
        get().clearAuth();
      }
    } catch (error) {

      get().clearAuth();
    }
  },

  fetchUser: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    try {
      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        // Assuming response is the user object directly or { data: check }
        // Let's safe check based on common patterns.
        // If the response is { id:..., username:... }
        set({ user: userData.data || userData });
      }
    } catch (error) {

    }
  },

  initialize: async () => {
    // If we already have a token (e.g. from callback), just fetch user
    if (get().accessToken) {
      await get().fetchUser();
      set({ isInitializing: false });
      return;
    }
    set({ isInitializing: true });
    await get().refresh();
    set({ isInitializing: false });
  },
}));
