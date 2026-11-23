import type { Metadata } from "next"
import { ContactPageContent } from "@/features/static-pages/components/static-page"

export const metadata: Metadata = { title: "Contact | FreshCart", description: "Contact FreshCart support by email." }
export default function ContactPage() { return <ContactPageContent /> }
