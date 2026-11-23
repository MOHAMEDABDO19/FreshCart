"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { AuthUser } from "@/features/auth/schemas/auth-request.schema"
import { clearRegisteredQueryClient } from "@/lib/query-client-registry"

export const AUTH_STORAGE_KEY = "freshcart-auth-user"

type AuthState = {
  user: AuthUser | null
  userId: string | null
  hasHydrated: boolean
  authReady: boolean
  setUser: (user: AuthUser) => void
  updateUser: (user: AuthUser) => void
  setUserId: (userId: string | null) => void
  clearUser: () => void
  setHasHydrated: (value: boolean) => void
  setAuthReady: (value: boolean) => void
  logout: () => Promise<void>
  clearLocalAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      hasHydrated: false,
      authReady: false,
      setUser: (user) => set({ user, userId: null }),
      updateUser: (user) => set({ user }),
      setUserId: (userId) => set({ userId }),
      clearUser: () => set({ user: null, userId: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setAuthReady: (authReady) => set({ authReady }),
      clearLocalAuth: () => {
        set({ user: null, userId: null })
        clearRegisteredQueryClient()
      },
      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
        } catch (error) {
          console.error("Unable to clear the authentication cookie.", error)
        } finally {
          set({ user: null, userId: null })
          clearRegisteredQueryClient()
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ user: state.user, userId: state.userId }) as AuthState,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
)
