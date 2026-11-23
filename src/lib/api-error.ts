import axios from "axios"
import { ApiErrorSchema } from "@/schemas/api-error.schema"

export function getApiErrorMessage(
  error: unknown,
  fallback = "The request could not be completed. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const parsed = ApiErrorSchema.safeParse(error.response?.data)
    if (parsed.success) return parsed.data.message
    const responseData = error.response?.data
    if (typeof responseData === "object" && responseData !== null && "errors" in responseData) {
      const validationErrors = responseData.errors
      if (typeof validationErrors === "object" && validationErrors !== null && "msg" in validationErrors && typeof validationErrors.msg === "string") {
        return validationErrors.msg
      }
    }
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
