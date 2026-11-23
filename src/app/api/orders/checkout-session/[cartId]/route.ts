import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { apiClient } from "@/api/client"
import { AUTH_TOKEN_COOKIE } from "@/api/server-auth-interceptor"
import { CashOrderRequestSchema, StripeCheckoutResponseSchema } from "@/features/checkout/schemas/checkout.schema"
import { forwardAuthApiError } from "@/features/auth/services/auth-route.utils"
import { isMongoObjectId } from "@/api/route-id"

export async function POST(request: Request, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params
  if (!isMongoObjectId(cartId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid cart ID." }, { status: 400 })
  if (!(await cookies()).has(AUTH_TOKEN_COOKIE)) return NextResponse.json({ statusMsg: "fail", message: "Sign in to continue to payment." }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid checkout request body." }, { status: 400 })
  }
  const parsedBody = CashOrderRequestSchema.safeParse(body)
  if (!parsedBody.success) return NextResponse.json({ statusMsg: "fail", message: "Invalid shipping address." }, { status: 400 })

  try {
    const url = new URL(request.url)
    const response = await apiClient.post<unknown>(
      `/orders/checkout-session/${encodeURIComponent(cartId)}?url=${encodeURIComponent(url.origin)}`,
      parsedBody.data,
      { headers: { "Content-Type": "application/json" } },
    )
    const parsedResponse = StripeCheckoutResponseSchema.safeParse(response.data)
    if (!parsedResponse.success || new URL(parsedResponse.data.session.url).hostname !== "checkout.stripe.com") {
      return NextResponse.json({ statusMsg: "fail", message: "The payment session response was invalid." }, { status: 502 })
    }
    return NextResponse.json(parsedResponse.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardAuthApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
