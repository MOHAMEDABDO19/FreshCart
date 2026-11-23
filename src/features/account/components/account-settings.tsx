"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { Eye, EyeOff, KeyRound, LoaderCircle, Save } from "lucide-react"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuthStore } from "@/store/auth-store"
import { useChangeMyPassword, useUpdateMe } from "@/features/users/hooks/use-users"
import { ChangeMyPasswordRequestSchema, UpdateMeErrorSchema, UpdateMeRequestSchema } from "@/features/users/schemas/user-request.schema"
import type { ChangeMyPasswordRequest } from "@/features/users/schemas/user-request.schema"
import { ROUTES } from "@/constants/routes"

const UpdateProfileFormSchema = UpdateMeRequestSchema
type UpdateProfileForm = z.infer<typeof UpdateProfileFormSchema>

const ChangePasswordFormSchema = ChangeMyPasswordRequestSchema.refine(
  (values) => values.password === values.rePassword,
  { path: ["rePassword"], message: "Passwords do not match." },
)

function AccountField({ label, id, type = "text", registration, error, autoComplete }: {
  label: string
  id: string
  type?: "text" | "email" | "tel" | "password"
  registration: UseFormRegisterReturn
  error?: string
  autoComplete?: string
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type
  return <div className="space-y-2"><label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label><div className="relative"><input id={id} type={inputType} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100" />{isPassword ? <button type="button" aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</button> : null}</div>{error ? <p id={`${id}-error`} className="text-xs text-red-600">{error}</p> : null}</div>
}

function MutationMessage({ error, success }: { error?: unknown; success?: string }) {
  if (error) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{getApiErrorMessage(error)}</p>
  if (success) return <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>
  return null
}

function readUpdateMeFieldError(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return null
  const response = error.response
  if (typeof response !== "object" || response === null || !("data" in response)) return null
  const parsed = UpdateMeErrorSchema.safeParse(response.data)
  return parsed.success ? parsed.data.errors : null
}

export function AccountSettings() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const profileMutation = useUpdateMe()
  const passwordMutation = useChangeMyPassword()
  const [profileSuccess, setProfileSuccess] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(UpdateProfileFormSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", phone: "" },
    shouldFocusError: true,
  })
  const passwordForm = useForm<ChangeMyPasswordRequest>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: { currentPassword: "", password: "", rePassword: "" },
    shouldFocusError: true,
  })

  const submitProfile = profileForm.handleSubmit(async (values) => {
    setProfileSuccess("")
    profileMutation.reset()
    try {
      await profileMutation.mutateAsync(values)
      if (user) updateUser({ ...user, name: values.name, email: values.email })
      profileForm.reset(values)
      setProfileSuccess("Your account data was updated.")
    } catch (error) {
      const fieldError = readUpdateMeFieldError(error)
      if (fieldError && (fieldError.param === "name" || fieldError.param === "email" || fieldError.param === "phone")) {
        profileForm.setError(fieldError.param, { type: "server", message: fieldError.msg })
      }
    }
  })

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    setPasswordSuccess("")
    passwordMutation.reset()
    try {
      await passwordMutation.mutateAsync(values)
      passwordForm.reset({ currentPassword: "", password: "", rePassword: "" })
      setPasswordSuccess("Your password was changed.")
    } catch {
      // The mutation error is rendered below; this request must not change the session.
    }
  })

  return <>
    <ScrollReveal>
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><h2 className="text-lg font-semibold text-slate-900">Update my data</h2><p className="mt-1 text-sm text-slate-500">Edit the account details saved to your profile.</p></div>
        <form className="space-y-4" onSubmit={submitProfile}>
          <AccountField label="Name" id="profile-name" autoComplete="name" registration={profileForm.register("name")} error={profileForm.formState.errors.name?.message} />
          <AccountField label="Email" id="profile-email" autoComplete="email" registration={profileForm.register("email")} error={profileForm.formState.errors.email?.message} />
          <AccountField label="Phone" id="profile-phone" type="tel" autoComplete="tel" registration={profileForm.register("phone")} error={profileForm.formState.errors.phone?.message} />
          <MutationMessage error={profileMutation.error} success={profileSuccess} />
          <button type="submit" disabled={!profileForm.formState.isDirty || profileMutation.isPending} className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{profileMutation.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{profileMutation.isPending ? "Saving..." : "Update my data"}</button>
        </form>
      </section>
    </ScrollReveal>

    <ScrollReveal delayMs={70}>
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5"><h2 className="text-lg font-semibold text-slate-900">Change password</h2><p className="mt-1 text-sm text-slate-500">Enter your current password, then choose a new one.</p></div>
        <form className="space-y-4" onSubmit={submitPassword}>
          <AccountField label="Current password" id="current-password" type="password" autoComplete="current-password" registration={passwordForm.register("currentPassword")} error={passwordForm.formState.errors.currentPassword?.message} />
          <AccountField label="New password" id="new-password" type="password" autoComplete="new-password" registration={passwordForm.register("password")} error={passwordForm.formState.errors.password?.message} />
          <AccountField label="Confirm new password" id="confirm-password" type="password" autoComplete="new-password" registration={passwordForm.register("rePassword")} error={passwordForm.formState.errors.rePassword?.message} />
          <Link href={ROUTES.forgotPassword} className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><KeyRound className="size-4" aria-hidden="true" />Forgot your password?</Link>
          <MutationMessage error={passwordMutation.error} success={passwordSuccess} />
          <button type="submit" disabled={passwordMutation.isPending} className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50">{passwordMutation.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}{passwordMutation.isPending ? "Changing..." : "Change password"}</button>
        </form>
      </section>
    </ScrollReveal>
  </>
}
