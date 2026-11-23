"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"
import { MapPin, Plus, Trash2, LoaderCircle } from "lucide-react"
import { CloseButton } from "@/components/shared/close-button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ModalDialog } from "@/components/shared/modal-dialog"
import { ScrollReveal } from "@/components/shared/scroll-reveal"
import { getApiErrorMessage } from "@/lib/api-error"
import { getRevealDelay, MOTION } from "@/constants/motion"
import { AddAddressSchema, type Address } from "@/features/addresses/schemas/address.schema"
import { useAddAddress, useAddresses, useRemoveAddress } from "@/features/addresses/hooks/use-addresses"
import type { AddAddressInput } from "@/features/addresses/schemas/address.schema"

const AddressFormSchema = AddAddressSchema

function AddressField({ id, label, registration, error, multiline = false, type = "text" }: {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  multiline?: boolean
  type?: "text" | "tel"
}) {
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/60 focus:ring-4 focus:ring-brand/10 aria-[invalid=true]:border-red-400"
  return <div className="space-y-2"><label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>{multiline ? <textarea id={id} rows={3} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className={`${inputClass} min-h-24 py-3`} /> : <input id={id} type={type} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...registration} className={`${inputClass} h-11`} />}{error ? <p id={`${id}-error`} className="text-xs text-red-600">{error}</p> : null}</div>
}

function AddressSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading addresses">{[0, 1].map((item) => <div key={item} className="rounded-2xl border border-slate-100 bg-white p-5"><span className="loading-skeleton block h-5 w-1/3 rounded" /><span className="loading-skeleton mt-4 block h-4 w-full rounded" /><span className="loading-skeleton mt-2 block h-4 w-2/3 rounded" /></div>)}<span className="sr-only">Loading addresses…</span></div>
}

function AddressCard({ address, index, leaving, busy, onRemove }: { address: Address; index: number; leaving: boolean; busy: boolean; onRemove: (address: Address, trigger: HTMLButtonElement) => void }) {
  return <ScrollReveal delayMs={getRevealDelay(index)} className="h-full"><article style={{ transitionDuration: `${MOTION.reviewDeleteDurationMs}ms` }} className={`motion-card h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-[transform,opacity] ${leaving ? "translate-y-1 opacity-0" : ""}`}>
    <div className="flex items-start justify-between gap-3"><span className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand"><MapPin className="size-5" aria-hidden="true" /></span><h2 className="truncate text-base font-semibold text-slate-900">{address.name}</h2></span><button type="button" disabled={busy || leaving} onClick={(event) => onRemove(address, event.currentTarget)} aria-label={`Remove ${address.name} address`} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" /></button></div>
    <dl className="mt-4 space-y-2 text-sm"><div><dt className="sr-only">Address details</dt><dd className="whitespace-pre-wrap break-words leading-6 text-slate-600">{address.details}</dd></div><div className="flex flex-wrap gap-x-2"><dt className="font-medium text-slate-500">Phone</dt><dd className="break-all text-slate-700">{address.phone}</dd></div><div className="flex flex-wrap gap-x-2"><dt className="font-medium text-slate-500">City</dt><dd className="break-words text-slate-700">{address.city}</dd></div></dl>
  </article></ScrollReveal>
}

export function AccountAddresses() {
  const query = useAddresses()
  const addMutation = useAddAddress()
  const removeMutation = useRemoveAddress()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addError, setAddError] = useState("")
  const [leavingId, setLeavingId] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)
  const addTriggerRef = useRef<HTMLButtonElement | null>(null)
  const addReturnFocusRef = useRef<HTMLButtonElement | null>(null)
  const addCancelRef = useRef<HTMLButtonElement | null>(null)
  const deleteTriggerRef = useRef<HTMLElement | null>(null)
  const form = useForm<AddAddressInput>({ resolver: zodResolver(AddressFormSchema), defaultValues: { name: "", details: "", phone: "", city: "" }, shouldFocusError: true })
  const addresses = query.data?.data ?? []

  const submitAddress = form.handleSubmit(async (values) => {
    setAddError("")
    try {
      await addMutation.mutateAsync(values)
      form.reset({ name: "", details: "", phone: "", city: "" })
      setDialogOpen(false)
    } catch (error) {
      setAddError(getApiErrorMessage(error, "The address could not be added."))
    }
  })

  const confirmRemove = async () => {
    if (!deleteTarget) return
    setLeavingId(deleteTarget._id)
    await new Promise<void>((resolve) => window.setTimeout(resolve, MOTION.reviewDeleteDurationMs))
    try {
      await removeMutation.mutateAsync(deleteTarget._id)
      setDeleteTarget(null)
    } finally {
      setLeavingId("")
    }
  }

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ScrollReveal><div><h2 className="text-lg font-semibold text-slate-900">Saved addresses</h2><p className="mt-1 text-sm text-slate-500">{query.isSuccess ? `${addresses.length} saved ${addresses.length === 1 ? "address" : "addresses"}` : "Manage your delivery addresses."}</p></div></ScrollReveal>
      <button ref={addTriggerRef} type="button" onClick={(event) => { addReturnFocusRef.current = event.currentTarget; setDialogOpen(true) }} className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"><Plus className="size-4" aria-hidden="true" />Add address</button>
      <ModalDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setAddError("") }} titleId="add-address-title" descriptionId="add-address-description" initialFocusRef={addCancelRef} returnFocusRef={addReturnFocusRef}>
            <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand"><MapPin className="size-5" /></span><div><h2 id="add-address-title" className="text-lg font-semibold text-slate-900">Add address</h2><p id="add-address-description" className="mt-1 text-sm text-slate-500">Enter the address details for delivery.</p></div></div><CloseButton onClick={() => setDialogOpen(false)} aria-label="Close add address dialog" /></div>
            <form className="mt-5 space-y-4" onSubmit={submitAddress}>
              <AddressField id="address-name" label="Name" registration={form.register("name")} error={form.formState.errors.name?.message} />
              <AddressField id="address-details" label="Details" multiline registration={form.register("details")} error={form.formState.errors.details?.message} />
              <AddressField id="address-phone" label="Phone" type="tel" registration={form.register("phone")} error={form.formState.errors.phone?.message} />
              <AddressField id="address-city" label="City" registration={form.register("city")} error={form.formState.errors.city?.message} />
              {addError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{addError}</p> : null}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button ref={addCancelRef} type="button" onClick={() => setDialogOpen(false)} disabled={addMutation.isPending} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={addMutation.isPending} className="motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{addMutation.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}{addMutation.isPending ? "Saving..." : "Save address"}</button></div>
            </form>
      </ModalDialog>
    </div>

    {query.isPending ? <AddressSkeleton /> : null}
    {query.isError ? <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{getApiErrorMessage(query.error, "Your addresses could not be loaded.")}<button type="button" onClick={() => void query.refetch()} className="ml-2 font-semibold underline underline-offset-2">Try again</button></div> : null}
    {query.isSuccess && addresses.length === 0 ? <ScrollReveal><div className="rounded-2xl border border-slate-100 bg-white px-5 py-12 text-center shadow-sm"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-brand"><MapPin className="size-6" aria-hidden="true" /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">No addresses saved</h2><p className="mt-1 text-sm text-slate-500">Add an address for your deliveries.</p><button type="button" onClick={(event) => { addReturnFocusRef.current = event.currentTarget; setDialogOpen(true) }} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark"><Plus className="size-4" aria-hidden="true" />Add your first address</button></div></ScrollReveal> : null}
    {query.isSuccess && addresses.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{addresses.map((address, index) => <AddressCard key={address._id} address={address} index={index} leaving={leavingId === address._id} busy={removeMutation.isPending || Boolean(leavingId)} onRemove={(target, trigger) => { deleteTriggerRef.current = trigger; setDeleteTarget(target) }} />)}</div> : null}

    <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !removeMutation.isPending) setDeleteTarget(null) }} title="Remove address?" description={`Remove ${deleteTarget?.name ?? "this address"} from your saved addresses?`} confirmLabel={removeMutation.isPending ? "Removing…" : "Remove address"} cancelLabel="Keep address" variant="destructive" icon={Trash2} error={removeMutation.isError ? getApiErrorMessage(removeMutation.error, "The address could not be removed.") : undefined} onConfirm={confirmRemove} returnFocusRef={deleteTriggerRef} />
  </>
}
