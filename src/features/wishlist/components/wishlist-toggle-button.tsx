"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import type { Product, ProductProjection } from "@/features/products/schemas/product.schema"
import { WishlistProductSchema } from "@/features/wishlist/schemas/wishlist.schema"
import { useAddToWishlist, useRemoveFromWishlist, useWishlist, isDuplicateWishlistError } from "@/features/wishlist/hooks/use-wishlist"
import { useAuthStore } from "@/store/auth-store"
import { loginRedirectPath } from "@/constants/routes"

type WishlistToggleButtonProps = {
  product: Product | ProductProjection
  className: string
  iconClassName: string
}

export function WishlistToggleButton({ product, className, iconClassName }: WishlistToggleButtonProps) {
  const [pop, setPop] = useState(false)
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const wishlist = useWishlist(authReady && Boolean(user))
  const addMutation = useAddToWishlist()
  const removeMutation = useRemoveFromWishlist()
  const productId = product._id
  const isWishlisted = Boolean(productId && wishlist.data?.data.some((item) => item._id === productId))
  const pending = addMutation.isPending || removeMutation.isPending

  const toggleWishlist = () => {
    if (!authReady || pending || !productId) return
    if (!user) {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
      router.push(loginRedirectPath(currentPath))
      return
    }

    setPop(true)
    window.setTimeout(() => setPop(false), 250)
    if (isWishlisted) {
      removeMutation.mutate({ productId })
      return
    }

    const parsedProduct = WishlistProductSchema.safeParse(product)
    addMutation.mutate({
      productId,
      ...(parsedProduct.success ? { product: parsedProduct.data } : {}),
    }, {
      onError: (error) => {
        if (!isDuplicateWishlistError(error)) setPop(false)
      },
    })
  }

  return (
    <button
      type="button"
      aria-label={isWishlisted ? `Remove ${product.title ?? "product"} from wishlist` : `Add ${product.title ?? "product"} to wishlist`}
      aria-pressed={isWishlisted}
      disabled={!authReady || !productId || pending || (Boolean(user) && wishlist.isPending)}
      onClick={toggleWishlist}
      className={className}
    >
      <Heart className={`${iconClassName} ${isWishlisted ? "fill-red-500 text-red-500" : ""} ${pop ? "motion-heart-pop" : ""}`} aria-hidden="true" />
    </button>
  )
}
