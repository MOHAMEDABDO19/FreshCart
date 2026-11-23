import type { Metadata } from "next"
import { LegalTemplatePage } from "@/features/static-pages/components/static-page"

export const metadata: Metadata = { title: "Privacy Policy | FreshCart", description: "Sample privacy policy template for review." }
export default function PrivacyPage() { return <LegalTemplatePage kind="privacy" /> }
