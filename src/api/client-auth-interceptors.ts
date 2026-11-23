"use client"

import axios from "axios"
import { apiClient } from "@/api/client"
import { useAuthStore } from "@/store/auth-store"

let installed = false
let handlingUnauthorized = false

export function installClientAuthInterceptors(): void {
  if (installed) return
  installed = true

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error)
      }

      const requestUrl = error.config?.url ?? ""
      if (/\/api\/auth\/(signin|signup)(?:\?|$)/i.test(requestUrl)) {
        return Promise.reject(error)
      }

      if (handlingUnauthorized) return Promise.reject(error)
      handlingUnauthorized = true

      try {
        await useAuthStore.getState().logout()
        const pathname = window.location.pathname
        const isAuthPage = ["/login", "/register", "/sign-in", "/sign-up"].includes(pathname)

        if (!isAuthPage) {
          const redirect = `${pathname}${window.location.search}${window.location.hash}`
          window.dispatchEvent(new CustomEvent("freshcart:auth-unauthorized", {
            detail: { href: `/login?redirect=${encodeURIComponent(redirect)}` },
          }))
        }
      } finally {
        handlingUnauthorized = false
      }

      return Promise.reject(error)
    },
  )
}
