import type { QueryClient } from "@tanstack/react-query"

let queryClient: QueryClient | undefined

export function registerQueryClient(client: QueryClient): void {
  queryClient = client
}

export function clearRegisteredQueryClient(): void {
  queryClient?.clear()
}
