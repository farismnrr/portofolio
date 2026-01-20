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

  refresh: async () => {
    if (useAuthStore.getState().isInitializing && useAuthStore.getState().accessToken) return;

    set({ isInitializing: true });
    try {
      const response = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
      });
      const resBody = await response.json();

      if (response.ok && resBody.status && resBody.data?.access_token) {
        set({
          accessToken: resBody.data.access_token,
          isAuthenticated: true,
        });
      } else {
        set({
          accessToken: null,
          isAuthenticated: false,
        });
      }
    } catch (_error) {
      set({
        accessToken: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isInitializing: false });
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
