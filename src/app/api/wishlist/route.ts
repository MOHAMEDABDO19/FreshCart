import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { AddToWishlistRequestSchema } from "@/features/wishlist/schemas/wishlist.schema"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"

export async function GET() {
  try {
    const response = await apiClient.get<unknown>("/wishlist")
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function POST(request: Request) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid wishlist request body" }, { status: 400 })
  }
  const parsedBody = AddToWishlistRequestSchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return NextResponse.json(
      { statusMsg: "fail", message: "Invalid wishlist request body" },
      { status: 400 },
    )
  }

  try {
    const response = await apiClient.post<unknown>("/wishlist", parsedBody.data)
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
