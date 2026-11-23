import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { AddToCartRequestSchema } from "@/features/cart/schemas/cart.schema"
import { forwardCartApiError, getCartApiV2BaseUrl } from "@/features/cart/services/cart-route.utils"

export async function GET() {
  try {
    const response = await apiClient.get<unknown>("/cart", { baseURL: getCartApiV2BaseUrl() })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid cart request body" }, { status: 400 })
  }
  const parsedBody = AddToCartRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid cart request body" }, { status: 400 })
  }

  try {
    const response = await apiClient.post<unknown>("/cart", parsedBody.data, { baseURL: getCartApiV2BaseUrl() })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function DELETE() {
  try {
    const response = await apiClient.delete<unknown>("/cart", { baseURL: getCartApiV2BaseUrl() })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
