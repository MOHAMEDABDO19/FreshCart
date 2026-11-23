import type { Metadata } from "next"
import { SignUpScreen } from "@/features/auth/components/auth-screens"

export const metadata: Metadata = { title: "Create Account | FreshCart", robots: { index: false, follow: false } }

export default function RegisterPage() {
  return <SignUpScreen />
}
