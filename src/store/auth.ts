import { getApiUrl } from "@/lib/config/backend";
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
  setAccessToken: (token: string | null) => Promise<void>;
  clearAuth: () => void;
  refresh: () => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setInitializing: (status: boolean) => void;
  initialize: (forceRefresh?: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAccessToken: async (token) => {
    set({
      accessToken: token,
      isAuthenticated: !!token,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setInitializing: (status: boolean) => {
    set({ isInitializing: status });
  },

  fetchUser: async () => {
    const get = _get as unknown as () => AuthState;
    const token = get().accessToken;

    if (!token) return;

    try {
      const response = await fetch(getApiUrl("/auth/user"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const resBody = await response.json();
        if ((resBody.status || resBody.success) && resBody.data) {
          set({ user: resBody.data });
        }
      }
    } catch (_error) {
      // Silently fail - user data is optional
    }
  },

  refresh: async () => {
    set({ isInitializing: true });
    try {
      const response = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
      });
      const resBody = await response.json();

      if (response.ok && (resBody.status || resBody.success) && resBody.data?.access_token) {
        set({
          accessToken: resBody.data.access_token,
          isAuthenticated: true,
        });

        // Fetch user data after successful refresh
        const get = _get as unknown as () => AuthState;
        await get().fetchUser();
      } else {
        // Refresh failed - clear auth and redirect to login
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (_error) {
      // Network error or other failure - clear auth and redirect
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } finally {
      set({ isInitializing: false });
    }
  },

  logout: async () => {
    try {
      const get = _get as unknown as () => AuthState;
      const token = get().accessToken;

      if (token) {
        // Call backend logout to clear cookie and invalidate session
        await fetch(getApiUrl("/auth/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (_error) {
      // Ignore errors - we're logging out anyway
    } finally {
      // Clear local state
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  initialize: async (forceRefresh = false) => {
    if (forceRefresh) {
      const get = _get as unknown as () => AuthState;
      await get().refresh();
    } else {
      set({ isInitializing: false });
    }
  },
}));
