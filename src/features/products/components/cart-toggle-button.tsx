"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import type { Product, ProductProjection } from "@/features/products/schemas/product.schema"
import { CartProductSchema, type CartResponse } from "@/features/cart/schemas/cart.schema"
import { cartQueryKeys, useAddToCart, useCart, useRemoveFromCart } from "@/features/cart/hooks/use-cart"
import { useAuthStore } from "@/store/auth-store"
import { loginRedirectPath } from "@/constants/routes"
import { getApiErrorMessage } from "@/lib/api-error"

type CartToggleButtonProps = {
  product: Product | ProductProjection
}

function createOptimisticCart(current: CartResponse | null | undefined, product: Product | ProductProjection): CartResponse | null {
  if (!product._id || product.price === undefined) return current ?? null

  const parsedProduct = CartProductSchema.safeParse({ ...product, id: product.id ?? product._id })
  if (!parsedProduct.success) return current ?? null

  const price = product.priceAfterDiscount ?? product.price
  const line = {
    _id: `optimistic-${product._id}`,
    count: 1,
    price,
    product: parsedProduct.data,
  }

  if (!current) {
    return {
      status: "success",
      message: "",
      numOfCartItems: 1,
      cartId: null,
      data: { products: [line], totalCartPrice: price },
    }
  }

  return {
    ...current,
    numOfCartItems: current.numOfCartItems + 1,
    data: {
      ...current.data,
      products: [...current.data.products, line],
      totalCartPrice: current.data.totalCartPrice + price,
    },
  }
}

export function CartToggleButton({ product }: CartToggleButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const cartQuery = useCart(authReady && Boolean(user))
  const addMutation = useAddToCart()
  const removeMutation = useRemoveFromCart()
  const [error, setError] = useState("")
  const cart = cartQuery.data
  const productId = product._id
  const cartLine = cart?.data.products.find((line) => line.product._id === productId)
  const pending = addMutation.isPending || removeMutation.isPending

  const toggle = async () => {
    if (!authReady || !productId || pending) return
    if (!user) {
      router.push(loginRedirectPath(`${window.location.pathname}${window.location.search}`))
      return
    }
    if (cartQuery.isPending || cartQuery.isError) return

    setError("")
    const queryKey = cartQueryKeys.detail()
    await queryClient.cancelQueries({ queryKey })
    const previous = queryClient.getQueryData<CartResponse | null>(queryKey)

    if (cartLine) {
      queryClient.setQueryData<CartResponse | null>(queryKey, (current) => current ? {
        ...current,
        numOfCartItems: Math.max(0, current.numOfCartItems - cartLine.count),
        data: {
          ...current.data,
          products: current.data.products.filter((line) => line.product._id !== productId),
          totalCartPrice: Math.max(0, current.data.totalCartPrice - cartLine.price * cartLine.count),
        },
      } : current)
      try {
        await removeMutation.mutateAsync({ productId })
      } catch (cause) {
        queryClient.setQueryData(queryKey, previous)
        setError(getApiErrorMessage(cause, "This product could not be removed from your cart."))
      }
      return
    }

    const optimisticCart = createOptimisticCart(previous, product)
    if (optimisticCart) queryClient.setQueryData(queryKey, optimisticCart)
    try {
      await addMutation.mutateAsync({ productId })
    } catch (cause) {
      queryClient.setQueryData(queryKey, previous)
      setError(getApiErrorMessage(cause, "This product could not be added to your cart."))
    }
  }

  const label = cartLine ? `Remove ${product.title ?? "product"} from cart` : `Add ${product.title ?? "product"} to cart`
  const disabled = !productId || !authReady || (Boolean(user) && (cartQuery.isPending || cartQuery.isError)) || pending

  return (
    <span className="inline-flex flex-col items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={error ? `cart-toggle-${productId}-error` : undefined}
        title={error || label}
        disabled={disabled}
        onClick={() => void toggle()}
        className="motion-button flex size-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition-transform hover:scale-105 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait disabled:opacity-60 sm:size-9"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
      </button>
      {error ? <span id={`cart-toggle-${productId}-error`} role="alert" className="sr-only">{error}</span> : null}
    </span>
  )
}
