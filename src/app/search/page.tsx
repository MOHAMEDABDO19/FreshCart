import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/routes"

export default async function SearchRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const values = await searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item))
    else if (value !== undefined) query.set(key, value)
  }
  redirect(`${ROUTES.products}${query.size ? `?${query.toString()}` : ""}`)
}
