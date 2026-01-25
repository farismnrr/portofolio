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
  refresh: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setInitializing: (status: boolean) => void;
  initialize: (forceRefresh?: boolean) => Promise<void>;
}

let refreshPromise: Promise<boolean> | null = null;

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
        if ((resBody.status || resBody.success) && resBody.data?.user) {
          set({ user: resBody.data.user });
        }
      }
    } catch (_error) {
      // Silently fail - user data is optional
    }
  },

  refresh: async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      set({ isInitializing: true });
      try {
        const response = await fetch(getApiUrl("/auth/refresh"), {
          method: "POST",
        });

        const resBody = await response.json().catch(() => ({}));

        if (response.ok && (resBody.status || resBody.success) && resBody.data?.access_token) {
          set({
            accessToken: resBody.data.access_token,
            isAuthenticated: true,
          });

          // Fetch user data after successful refresh
          const get = _get as unknown as () => AuthState;
          await get().fetchUser();
          return true;
        }

        // Refresh failed (401, 403, etc.)
        console.warn("Token refresh failed:", resBody.message || "Unknown error");

        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          // Add a small delay for state to settle before redirect
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login?reason=session_expired";
            }
          }, 100);
        }
        return false;
      } catch (error) {
        console.error("Token refresh crash:", error);
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?reason=network_error";
        }
        return false;
      } finally {
        set({ isInitializing: false });
        refreshPromise = null;
      }
    })();

    return refreshPromise;
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
