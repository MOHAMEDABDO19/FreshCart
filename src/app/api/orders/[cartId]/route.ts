import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { CashOrderRequestSchema } from "@/features/checkout/schemas/checkout.schema"
import { forwardCartApiError, getCartApiV2BaseUrl } from "@/features/cart/services/cart-route.utils"
import { isMongoObjectId } from "@/api/route-id"

export async function POST(request: Request, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params
  if (!isMongoObjectId(cartId)) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid cart ID." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid checkout request body." }, { status: 400 })
  }

  const parsedBody = CashOrderRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid shipping address." }, { status: 400 })
  }

  try {
    const response = await apiClient.post<unknown>(
      `/orders/${encodeURIComponent(cartId)}`,
      parsedBody.data,
      {
        baseURL: getCartApiV2BaseUrl(),
        headers: { "Content-Type": "application/json" },
      },
    )
    // The upstream success response shape has not been provided; forward its HTTP status only.
    return new NextResponse(null, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
