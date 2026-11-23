import { NextResponse } from "next/server"
import { apiClient } from "@/api/client"
import "@/api/server-auth-interceptor"
import { SetCartQuantityRequestSchema } from "@/features/cart/schemas/cart.schema"
import { forwardCartApiError, getCartApiV2BaseUrl } from "@/features/cart/services/cart-route.utils"
import { isMongoObjectId } from "@/api/route-id"

type RouteContext = { params: Promise<{ productId: string }> }

export async function PUT(request: Request, context: RouteContext) {
  const { productId } = await context.params
  if (!isMongoObjectId(productId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid product id" }, { status: 400 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid cart quantity" }, { status: 400 })
  }
  const parsedBody = SetCartQuantityRequestSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ statusMsg: "fail", message: "Invalid cart quantity" }, { status: 400 })
  }

  try {
    const response = await apiClient.put<unknown>(`/cart/${encodeURIComponent(productId)}`, parsedBody.data, { baseURL: getCartApiV2BaseUrl() })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { productId } = await context.params
  if (!isMongoObjectId(productId)) return NextResponse.json({ statusMsg: "fail", message: "Invalid product id" }, { status: 400 })
  try {
    const response = await apiClient.delete<unknown>(`/cart/${encodeURIComponent(productId)}`, { baseURL: getCartApiV2BaseUrl() })
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    const forwarded = forwardCartApiError(error)
    if (forwarded) return forwarded
    throw error
  }
}
