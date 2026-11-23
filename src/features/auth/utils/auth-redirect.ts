import { ROUTES } from "@/constants/routes"

const AUTH_PATHS = new Set<string>([ROUTES.login, ROUTES.register])

export function getSafeAuthRedirect(search: string): string {
  const value = new URLSearchParams(search).get("redirect")
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/"

  try {
    const destination = new URL(value, window.location.origin)
    if (destination.origin !== window.location.origin || AUTH_PATHS.has(destination.pathname)) return "/"
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch (error) {
    if (error instanceof TypeError) return "/"
    throw error
  }
}
