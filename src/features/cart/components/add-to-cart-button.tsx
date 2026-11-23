"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, LoaderCircle, Plus } from "lucide-react"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAddToCart } from "@/features/cart/hooks/use-cart"
import { useAuthStore } from "@/store/auth-store"
import { loginRedirectPath } from "@/constants/routes"

type AddToCartButtonProps = {
  productId: string
  productTitle: string
  className?: string
  iconOnly?: boolean
  disabled?: boolean
}

export function AddToCartButton({ productId, productTitle, className, iconOnly = false, disabled = false }: AddToCartButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const authReady = useAuthStore((state) => state.authReady)
  const user = useAuthStore((state) => state.user)
  const mutation = useAddToCart()
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!success) return
    const timeout = window.setTimeout(() => setSuccess(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [success])

  const add = async () => {
    if (!authReady) return
    if (!user) {
      const currentPath = `${pathname}${window.location.search}`
      router.push(loginRedirectPath(currentPath))
      return
    }
    setErrorMessage("")
    setSuccess(false)
    try {
      await mutation.mutateAsync({ productId })
      setSuccess(true)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "This product could not be added to your cart."))
    }
  }

  const label = mutation.isPending ? "Adding…" : success ? "Added to cart" : `Add ${productTitle} to cart`
  return (
    <span className="inline-flex flex-col items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={errorMessage ? `${productId}-cart-error` : undefined}
        disabled={disabled || mutation.isPending || !authReady}
        onClick={() => void add()}
        className={`motion-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${className ?? "flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"}`}
      >
        {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : success ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
        {!iconOnly ? <span className="sr-only">{label}</span> : null}
      </button>
      {errorMessage ? <span id={`${productId}-cart-error`} role="alert" className="sr-only">{errorMessage}</span> : null}
      <span className="sr-only" aria-live="polite">{success ? `${productTitle} added to cart` : errorMessage}</span>
    </span>
  )
}
