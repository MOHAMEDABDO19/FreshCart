"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { loginRedirectPath } from "@/constants/routes"

export function ProtectedRoute({ children }: Readonly<{ children: ReactNode }>) {
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (authReady && !user) {
      const currentPath = `${pathname}${window.location.search}`
      router.replace(loginRedirectPath(currentPath))
    }
  }, [authReady, user, pathname, router])

  if (!authReady || !user) return null
  return children
}
