import { z } from "zod"

export const NewsletterEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email must be 254 characters or fewer")
  .email("Enter a valid email address")

export type NewsletterEmail = z.infer<typeof NewsletterEmailSchema>
