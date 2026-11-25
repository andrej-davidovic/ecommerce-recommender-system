import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
  
  isHydratingUser: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserResponse | null) => void;
  setHydratingUser: (v: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydratingUser: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      setHydratingUser: (v) => set({ isHydratingUser: v }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "stopshop-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
