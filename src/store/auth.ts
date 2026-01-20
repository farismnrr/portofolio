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

  initialize: async (_forceRefresh = false) => {
    set({ isInitializing: false });
  },
}));
