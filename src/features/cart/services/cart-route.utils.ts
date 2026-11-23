import { NextResponse } from "next/server"
import axios from "axios"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"

export function getCartApiV2BaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured")
  const v2BaseUrl = baseUrl.replace(/\/api\/v1\/?$/, "/api/v2")
  if (v2BaseUrl === baseUrl) throw new Error("NEXT_PUBLIC_API_URL must end with /api/v1")
  return v2BaseUrl
}

export function forwardCartApiError(error: unknown): NextResponse | null {
  if (!axios.isAxiosError(error) || !error.response) return null
  return forwardAuthApiError(error)
}
