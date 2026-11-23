import type { Metadata } from "next"
import { LegalTemplatePage } from "@/features/static-pages/components/static-page"

export const metadata: Metadata = { title: "Terms of Service | FreshCart", description: "Sample terms of service template for review." }
export default function TermsPage() { return <LegalTemplatePage kind="terms" /> }
