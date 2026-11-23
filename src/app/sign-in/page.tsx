import { permanentRedirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"

export const metadata = { robots: { index: false, follow: false } }

export default function Page() {
  permanentRedirect(ROUTES.login)
}
