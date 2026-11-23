import type { Metadata } from "next"
import { FaqPageContent } from "@/features/static-pages/components/static-page"

export const metadata: Metadata = { title: "FAQ | FreshCart", description: "Answers about FreshCart orders, payments, accounts, and wishlist." }
export default function FaqPage() { return <FaqPageContent /> }
