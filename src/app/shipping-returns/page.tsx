import type { Metadata } from "next"
import { ShippingReturnsPageContent } from "@/features/static-pages/components/static-page"

export const metadata: Metadata = { title: "Shipping & Returns | FreshCart", description: "Shipping and returns information displayed by FreshCart." }
export default function ShippingReturnsPage() { return <ShippingReturnsPageContent /> }
