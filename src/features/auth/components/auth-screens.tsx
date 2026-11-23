"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, ShoppingBasket, Star, Truck, UserRound } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { z } from "zod"
import { Container } from "@/components/layout/container"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ServiceBenefits } from "@/features/home/components/service-benefits"
import { homePageData } from "@/features/home/data/home-page.data"
import { ApiErrorSchema } from "@/schemas/api-error.schema"
import { useForgotPassword, useResetPassword, useSignIn, useSignUp, useVerifyResetCode } from "@/features/auth/hooks/use-auth-mutations"
import { ForgotPasswordRequestSchema, ResetPasswordRequestSchema, SignInRequestSchema, SignUpRequestSchema, VerifyResetCodeRequestSchema } from "@/features/auth/schemas/auth-request.schema"
import type { AxiosError } from "axios"
import { useAuthStore } from "@/store/auth-store"
import { getSafeAuthRedirect } from "@/features/auth/utils/auth-redirect"
import { ROUTES } from "@/constants/routes"
import { showToast } from "@/store/toast-store"

type AuthFrameProps = {
  title: string
  subtitle: string
  children: React.ReactNode
  mode: "login" | "signup" | "reset"
}

function AuthFrame({ title, subtitle, children, mode }: AuthFrameProps) {
  const showcase = mode === "signup"
    ? { title: <>Welcome to <span className="text-brand">FreshCart</span></>, description: "Join thousands of happy customers who enjoy fresh groceries delivered right to their doorstep.", points: ["Premium Quality", "Fast Delivery", "Secure Shopping"] }
    : mode === "reset"
      ? { title: <>Reset Your Password</>, description: "We'll help you get back into your account in no time.", points: ["Email Verification", "Secure Reset", "Encrypted"] }
      : { title: <>FreshCart - Your One-Stop Shop for Fresh Products</>, description: "Join customers who trust FreshCart for their daily shopping needs.", points: ["Free Delivery", "Secure Payment", "24/7 Support"] }

  return (
    <>
      <SiteHeader data={homePageData.header} />
      <ScrollReveal as="main" id="main-content" className="auth-page py-8 sm:py-12 lg:py-16">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <section className="hidden text-center lg:block" aria-label="About FreshCart">
            <div className="auth-art mx-auto flex aspect-[1.35] max-w-[620px] items-center justify-center rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-100 shadow-[0_14px_30px_rgba(15,23,42,0.10)]">
              <div className="relative flex items-center justify-center">
                <span className="absolute -left-24 -top-20 size-24 rounded-full bg-emerald-100/70" />
                <span className="absolute -right-24 -bottom-16 size-28 rounded-full bg-emerald-100/70" />
                <div className="absolute -left-16 top-5 flex size-14 rotate-[-9deg] items-center justify-center rounded-2xl bg-white text-brand shadow-lg"><Mail className="size-6" aria-hidden="true" /></div>
                <div className="relative z-10 flex size-28 items-center justify-center rounded-[28px] bg-emerald-100 text-brand shadow-xl"><ShoppingBasket className="size-14" aria-hidden="true" /></div>
                <div className="absolute -right-16 top-7 flex size-14 rotate-[9deg] items-center justify-center rounded-2xl bg-white text-brand shadow-lg"><ShieldCheck className="size-6" aria-hidden="true" /></div>
              </div>
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-2xl font-bold tracking-tight text-slate-800 xl:text-3xl">{showcase.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">{showcase.description}</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-5 text-sm text-slate-500">
              {showcase.points.map((point, index) => {
                const Icon = [Truck, ShieldCheck, LockKeyhole][index]
                return <li key={point} className="inline-flex items-center gap-2"><Icon className="size-4 text-brand" aria-hidden="true" />{point}</li>
              })}
            </ul>
          </section>
          <section className="mx-auto w-full max-w-[570px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.10)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.13)] sm:p-8 lg:p-10" aria-labelledby="auth-title">
            <div className="mb-7 text-center">
              <Link href={ROUTES.home} className="inline-flex items-center text-2xl font-bold tracking-tight text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span className="text-brand">Fresh</span>Cart</Link>
              <h1 id="auth-title" className="mt-3 text-2xl font-bold text-slate-800">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
              {mode === "reset" ? <ol aria-label="Password reset progress" className="mx-auto mt-6 flex max-w-[250px] items-center justify-center"><li className="flex items-center"><span className={`flex size-9 items-center justify-center rounded-full ${title === "Forgot Password?" ? "bg-brand text-white ring-4 ring-emerald-100" : "bg-brand text-white"}`}><Mail className="size-4" aria-hidden="true" /></span></li><li className="h-px flex-1 bg-brand" /><li className="flex items-center"><span className={`flex size-9 items-center justify-center rounded-full ${title === "Check Your Email" ? "bg-brand text-white ring-4 ring-emerald-100" : title === "Forgot Password?" ? "bg-slate-100 text-slate-400" : "bg-brand text-white"}`}>{title === "Forgot Password?" ? <KeyRound className="size-4" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}</span></li><li className={`h-px flex-1 ${title === "Create New Password" ? "bg-brand" : "bg-slate-200"}`} /><li className="flex items-center"><span className={`flex size-9 items-center justify-center rounded-full ${title === "Create New Password" ? "bg-brand text-white ring-4 ring-emerald-100" : "bg-slate-100 text-slate-400"}`}><LockKeyhole className="size-4" aria-hidden="true" /></span></li></ol> : null}
            </div>
            {children}
          </section>
        </Container>
      </ScrollReveal>
      <ServiceBenefits items={homePageData.bottomBenefits} variant="strip" />
      <SiteFooter data={homePageData.footer} />
    </>
  )
}

function AuthFeedback({ error, success }: { error?: unknown; success?: string }) {
  const errorMessage = getAuthErrorMessage(error)
  if (errorMessage) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{errorMessage}</p>
  if (success) return <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{success}</p>
  return null
}

function FormField({ label, id, type = "text", placeholder, autoComplete, registration, error, revealable = false }: {
  label: string
  id: string
  type?: string
  placeholder: string
  autoComplete?: string
  registration: UseFormRegisterReturn
  error?: string
  revealable?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const fieldType = revealable && visible ? "text" : type
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={label ? "block text-sm font-medium text-slate-700" : "sr-only"}>{label || "Password"}</label>
      <div className="relative">
        <input id={id} type={fieldType} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100" />
        {revealable ? <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button> : null}
      </div>
      {error ? <p id={`${id}-error`} className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

const SignInFormSchema = SignInRequestSchema.extend({ email: z.string().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") })
type SignInForm = z.infer<typeof SignInFormSchema>

function SocialLoginOptions() {
  const unavailable = (provider: "Google" | "Facebook") => showToast(`${provider} sign-in isn’t configured yet.`, "info")
  return <div className="mb-5 space-y-3">
    <button type="button" onClick={() => unavailable("Google")} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span aria-hidden="true" className="text-lg font-bold text-red-500">G</span>Continue with Google</button>
    <button type="button" onClick={() => unavailable("Facebook")} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">f</span>Continue with Facebook</button>
    <div className="flex items-center gap-3 pt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />Or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
  </div>
}

export function SignInScreen() {
  const mutation = useSignIn()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const form = useForm<SignInForm>({ resolver: zodResolver(SignInFormSchema), defaultValues: { email: "", password: "" }, shouldFocusError: true })
  useEffect(() => {
    if (authReady && user) router.replace(ROUTES.home)
  }, [authReady, router, user])
  if (!authReady || user) return <main className="min-h-[55vh] bg-slate-50/60"><LoadingSpinner label="Preparing sign in" /></main>
  return <AuthFrame mode="login" title="Welcome Back!" subtitle="Sign in to continue your fresh shopping experience">
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values, { onSuccess: () => router.replace(getSafeAuthRedirect(window.location.search)) }))}>
      <SocialLoginOptions />
      <FormField label="Email Address" id="email" type="email" placeholder="Enter your email" autoComplete="email" registration={form.register("email")} error={form.formState.errors.email?.message} />
      <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><Link href={ROUTES.forgotPassword} className="text-sm text-brand transition hover:text-brand-dark hover:underline">Forgot Password?</Link></div><FormField label="" id="password" type="password" placeholder="Enter your password" autoComplete="current-password" registration={form.register("password")} error={form.formState.errors.password?.message} revealable /></div>
      <AuthFeedback error={mutation.error} success={mutation.isSuccess ? "Sign-in request completed." : undefined} />
      <button type="submit" disabled={mutation.isPending} className="motion-button w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(8,169,80,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{mutation.isPending ? "Signing In..." : "Sign In"}</button>
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-600">New to FreshCart? <Link href={ROUTES.register} className="font-semibold text-brand hover:underline">Create an account</Link></p>
      <p className="flex justify-center gap-4 text-[11px] text-slate-500"><span><LockKeyhole className="mr-1 inline size-3.5" />SSL Secured</span><span><UserRound className="mr-1 inline size-3.5" />Account Access</span><span><Star className="mr-1 inline size-3.5" />FreshCart</span></p>
    </form>
  </AuthFrame>
}

const SignUpFormSchema = SignUpRequestSchema.extend({ name: z.string().min(1, "Enter your name"), email: z.string().email("Enter a valid email address"), password: z.string().min(8, "Use at least 8 characters"), rePassword: z.string().min(1, "Confirm your password"), phone: z.string().min(1, "Enter your phone number") }).refine((value) => value.password === value.rePassword, { path: ["rePassword"], message: "Passwords do not match" })
type SignUpForm = z.infer<typeof SignUpFormSchema>

export function SignUpScreen() {
  const mutation = useSignUp()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const authReady = useAuthStore((state) => state.authReady)
  const form = useForm<SignUpForm>({ resolver: zodResolver(SignUpFormSchema), defaultValues: { name: "", email: "", password: "", rePassword: "", phone: "" }, shouldFocusError: true })
  useEffect(() => {
    if (authReady && user) router.replace(ROUTES.home)
  }, [authReady, router, user])
  if (!authReady || user) return <main className="min-h-[55vh] bg-slate-50/60"><LoadingSpinner label="Preparing registration" /></main>
  return <AuthFrame mode="signup" title="Create Your Account" subtitle="Start your fresh journey with us today">
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values, { onSuccess: () => router.replace(getSafeAuthRedirect(window.location.search)) }))}>
      <SocialLoginOptions />
      <FormField label="Name" id="name" placeholder="Your name" autoComplete="name" registration={form.register("name")} error={form.formState.errors.name?.message} />
      <FormField label="Email" id="email" type="email" placeholder="you@example.com" autoComplete="email" registration={form.register("email")} error={form.formState.errors.email?.message} />
      <FormField label="Password" id="password" type="password" placeholder="Create a password" autoComplete="new-password" registration={form.register("password")} error={form.formState.errors.password?.message} revealable />
      <FormField label="Confirm Password" id="rePassword" type="password" placeholder="Confirm your password" autoComplete="new-password" registration={form.register("rePassword")} error={form.formState.errors.rePassword?.message} revealable />
      <FormField label="Phone Number" id="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel" registration={form.register("phone")} error={form.formState.errors.phone?.message} />
      <AuthFeedback error={mutation.error} success={mutation.isSuccess ? "Your registration request completed successfully." : undefined} />
      <button type="submit" disabled={mutation.isPending} className="motion-button w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(8,169,80,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{mutation.isPending ? "Creating Account..." : "Create My Account"}</button>
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-600">Already have an account? <Link href={ROUTES.login} className="font-semibold text-brand hover:underline">Sign In</Link></p>
    </form>
  </AuthFrame>
}

export function ForgotPasswordScreen() {
  const mutation = useForgotPassword()
  const router = useRouter()
  const form = useForm<z.infer<typeof ForgotPasswordRequestSchema>>({ resolver: zodResolver(ForgotPasswordRequestSchema.extend({ email: z.string().email("Enter a valid email address") })), defaultValues: { email: "" } })
  // ASSUMPTION: A completed request is treated as success because the forgot-password success response is undocumented.
  const submit = form.handleSubmit((values) => mutation.mutate(values, { onSuccess: () => router.push(`${ROUTES.verifyResetCode}?email=${encodeURIComponent(values.email)}`) }))
  return <AuthFrame mode="reset" title="Forgot Password?" subtitle="No worries, we'll send you a reset code"><form className="space-y-5" onSubmit={submit}><FormField label="Email Address" id="email" type="email" placeholder="Enter your email address" autoComplete="email" registration={form.register("email")} error={form.formState.errors.email?.message} /><AuthFeedback error={mutation.error} /><button type="submit" disabled={mutation.isPending} className="w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:opacity-60">{mutation.isPending ? "Sending..." : "Send Reset Code"}</button><p className="text-center"><Link href={ROUTES.login} className="inline-flex items-center gap-2 text-sm text-brand hover:underline"><ArrowLeft className="size-4" />Back to Sign In</Link></p><p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-600">Remember your password? <Link href={ROUTES.login} className="font-semibold text-brand hover:underline">Sign In</Link></p></form></AuthFrame>
}

export function VerifyResetCodeScreen({ email }: { email: string }) {
  const mutation = useVerifyResetCode()
  const router = useRouter()
  const form = useForm<z.infer<typeof VerifyResetCodeRequestSchema>>({ resolver: zodResolver(VerifyResetCodeRequestSchema), defaultValues: { resetCode: "" } })
  // ASSUMPTION: The sample suggests a six-digit code; the verification success response is undocumented.
  const submit = form.handleSubmit((values) => mutation.mutate(values, { onSuccess: () => router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(email)}`) }))
  return <AuthFrame mode="reset" title="Check Your Email" subtitle={email ? `Enter the reset code sent to ${email}` : "Enter the reset code sent to your email"}><form className="space-y-5" onSubmit={submit}><div className="space-y-2"><label htmlFor="resetCode" className="block text-sm font-medium text-slate-700">Verification Code</label><input id="resetCode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="• • • • • •" {...form.register("resetCode")} className="h-14 w-full rounded-xl border border-slate-200 text-center text-lg tracking-[0.5em] outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/10" /></div><p className="text-right text-sm text-slate-500">Didn&apos;t receive the code? <Link href={`${ROUTES.forgotPassword}${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="font-medium text-brand hover:underline">Resend Code</Link></p><AuthFeedback error={mutation.error} /><button type="submit" disabled={mutation.isPending} className="w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:opacity-60">{mutation.isPending ? "Verifying..." : "Verify Code"}</button></form></AuthFrame>
}

// ASSUMPTION: Eight-character minimum and matching confirmation are UI rules; neither is specified by the API contract.
const ResetFormSchema = ResetPasswordRequestSchema.extend({ email: z.string().email(), newPassword: z.string().min(8, "Use at least 8 characters"), confirmPassword: z.string().min(1, "Confirm your password") }).refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
type ResetForm = z.infer<typeof ResetFormSchema>

export function ResetPasswordScreen({ email }: { email: string }) {
  const mutation = useResetPassword()
  const router = useRouter()
  const form = useForm<ResetForm>({ resolver: zodResolver(ResetFormSchema), defaultValues: { email, newPassword: "", confirmPassword: "" } })
  // ASSUMPTION: Mutation completion means success; no reset-password success response shape was supplied.
  const submit = form.handleSubmit((values) => mutation.mutate({ email: values.email, newPassword: values.newPassword }, { onSuccess: () => router.push(ROUTES.login) }))
  return <AuthFrame mode="reset" title="Create New Password" subtitle="Your new password must be different from previous passwords"><form className="space-y-5" onSubmit={submit}><FormField label="New Password" id="newPassword" type="password" placeholder="Enter new password" autoComplete="new-password" registration={form.register("newPassword")} error={form.formState.errors.newPassword?.message} revealable /><FormField label="Confirm Password" id="confirmPassword" type="password" placeholder="Confirm new password" autoComplete="new-password" registration={form.register("confirmPassword")} error={form.formState.errors.confirmPassword?.message} revealable /><AuthFeedback error={mutation.error} success={mutation.isSuccess ? "Password reset request completed." : undefined} /><button type="submit" disabled={mutation.isPending || !email} className="w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:opacity-60">{mutation.isPending ? "Resetting..." : "Reset Password"}</button></form></AuthFrame>
}

function getAuthErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined
  const responseData = (error as AxiosError<unknown>).response?.data
  const parsed = ApiErrorSchema.safeParse(responseData)
  return parsed.success ? parsed.data.message : error instanceof Error ? error.message : "The request could not be completed. Please try again."
}
