import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { ApplyCouponRequestSchema } from "@/features/cart/schemas/cart.schema"
import { forwardCartApiError, getCartApiV2BaseUrl } from "@/features/cart/services/cart-route.utils"

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid coupon request" }, { status: 400 })
  }
  const parsedBody = ApplyCouponRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid coupon request" }, { status: 400 })
  }

  try {
    const response = await apiClient.put<unknown>("/cart/applyCoupon", parsedBody.data, { baseURL: getCartApiV2BaseUrl() })
    return new NextResponse(null, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
