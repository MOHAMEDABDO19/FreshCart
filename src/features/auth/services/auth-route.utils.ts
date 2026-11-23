import axios from "axios"
import { NextResponse } from "next/server"
import { ApiErrorSchema } from "@/schemas/api-error.schema"

export function forwardAuthApiError(error: unknown): NextResponse | null {
  if (!axios.isAxiosError(error) || !error.response) {
    return null
  }

  const parsedError = ApiErrorSchema.safeParse(error.response.data)
  const safeError = parsedError.success
    ? parsedError.data
    : { statusMsg: "error" as const, message: "The request could not be completed." }

  return NextResponse.json(safeError, {
    status: error.response.status,
  })
}

export function setAuthTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set("freshcart_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}
