"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { installClientAuthInterceptors } from "@/api/client-auth-interceptors"
import { useVerifyToken } from "@/features/auth/hooks/use-auth-mutations"
import { AUTH_STORAGE_KEY, useAuthStore } from "@/store/auth-store"
import { ROUTES } from "@/constants/routes"

export function AuthSessionBootstrap() {
  const router = useRouter()
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const setAuthReady = useAuthStore((state) => state.setAuthReady)
  const setUserId = useAuthStore((state) => state.setUserId)
  const clearLocalAuth = useAuthStore((state) => state.clearLocalAuth)
  const logout = useAuthStore((state) => state.logout)
  const verification = useVerifyToken(hasHydrated)

  useEffect(() => {
    installClientAuthInterceptors()

    void useAuthStore.persist.rehydrate().catch((error: unknown) => {
      console.error("Unable to restore the persisted user session.", error)
      clearLocalAuth()
      setAuthReady(true)
    })

    const syncLogout = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY || !event.newValue) return
      try {
        const persisted = JSON.parse(event.newValue) as { state?: { user?: unknown } }
        if (persisted.state?.user === null && useAuthStore.getState().user) {
          clearLocalAuth()
          setAuthReady(true)
        }
      } catch (error) {
        console.warn("Ignoring malformed persisted authentication state.", error)
      }
    }

    window.addEventListener("storage", syncLogout)
    const handleUnauthorized = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const href = (event as CustomEvent<{ href?: string }>).detail?.href
      if (href?.startsWith(`${ROUTES.login}?redirect=`)) router.replace(href)
    }
    window.addEventListener("freshcart:auth-unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("storage", syncLogout)
      window.removeEventListener("freshcart:auth-unauthorized", handleUnauthorized)
    }
  }, [clearLocalAuth, router, setAuthReady])

  useEffect(() => {
    if (!hasHydrated) return
    if (verification.isSuccess) {
      setUserId(verification.data.decoded.id)
      setAuthReady(true)
    } else if (verification.isError) {
      void logout().finally(() => setAuthReady(true))
    }
  }, [hasHydrated, verification.data, verification.isError, verification.isSuccess, logout, setAuthReady, setUserId])

  return null
}
