import type { Metadata } from "next"
import { WishlistPage } from "@/features/wishlist/components/wishlist-page"

export const metadata: Metadata = { title: "Wishlist | FreshCart", robots: { index: false, follow: false } }

export default function Page() {
  return <WishlistPage />
}
