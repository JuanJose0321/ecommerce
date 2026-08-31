"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"

import {
  addAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/app/actions/auth"
import { AnimatedForm } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"
import type { CustomerAddress } from "@/lib/auth"

function handleSessionExpiry(message: string, router: ReturnType<typeof useRouter>) {
  if (message === "Sesión expirada.") {
    toast.error("Tu sesión expiró. Inicia sesión de nuevo.")
    router.push("/account/login")
    return true
  }
  return false
}

type FormState = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  phone: string
}

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  phone: "",
}

export function AddressBook({
  initialAddresses,
}: {
  initialAddresses: CustomerAddress[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const startEdit = (address: CustomerAddress) => {
    setEditingId(address.id)
    setShowNewForm(false)
    setForm({
      first_name: address.first_name ?? "",
      last_name: address.last_name ?? "",
      address_1: address.address_1 ?? "",
      address_2: address.address_2 ?? "",
      city: address.city ?? "",
      province: address.province ?? "",
      postal_code: address.postal_code ?? "",
      phone: address.phone ?? "",
    })
  }

  const startNew = () => {
    setEditingId(null)
    setShowNewForm(true)
    setForm(EMPTY_FORM)
  }

  const cancel = () => {
    setEditingId(null)
    setShowNewForm(false)
    setForm(EMPTY_FORM)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setError(null)

    const payload = { ...form, country_code: "mx" as const }
    const result = editingId
      ? await updateAddressAction(editingId, payload)
      : await addAddressAction(payload)

    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      if (!handleSessionExpiry(result.message, router)) {
        toast.error(result.message)
      }
      return
    }

    setStatus("idle")
    cancel()
    toast.success(editingId ? "Dirección actualizada" : "Dirección guardada")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const result = await deleteAddressAction(id)
    if (!result.ok) {
      if (!handleSessionExpiry(result.message, router)) {
        toast.error(result.message)
      }
      return
    }
    toast.success("Dirección eliminada")
    router.refresh()
  }

  const isFormOpen = showNewForm || editingId !== null

  return (
    <div className="space-y-6">
      {initialAddresses.length === 0 && !isFormOpen ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes direcciones guardadas.
        </p>
      ) : null}

      <ul className="space-y-4">
        <AnimatePresence initial={false}>
          {initialAddresses.map((address) => (
            <motion.li
              key={address.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-lg border border-border p-5 transition-colors hover:border-foreground/30"
            >
              <p className="text-sm font-medium">
                {address.first_name} {address.last_name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {address.address_1}
                {address.address_2 ? `, ${address.address_2}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.province}, {address.postal_code}
              </p>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="text-xs text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="text-xs text-destructive underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  Eliminar
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence mode="wait" initial={false}>
        {isFormOpen ? (
          <AnimatedForm
            key="address-form"
            onSubmit={handleSubmit}
            className="max-w-md space-y-5 rounded-lg border border-border p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nombre" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
              <FormField label="Apellido" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} required />
            </div>
            <FormField label="Dirección" value={form.address_1} onChange={(e) => setForm((f) => ({ ...f, address_1: e.target.value }))} required />
            <FormField
              label="Referencias (opcional)"
              value={form.address_2}
              onChange={(e) => setForm((f) => ({ ...f, address_2: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ciudad" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
              <FormField label="Estado" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Código postal"
                value={form.postal_code}
                onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                required
              />
              <FormField label="Teléfono" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {error ? (
                <FormBanner key="form-error" type="error">
                  {error}
                </FormBanner>
              ) : null}
            </AnimatePresence>

            <div className="flex gap-3">
              <SubmitButton loading={status === "submitting"} loadingText="Guardando..." className="w-auto px-5">
                Guardar dirección
              </SubmitButton>
              <button
                type="button"
                onClick={cancel}
                className="rounded-full border border-border px-5 py-2 text-sm transition-colors duration-200 hover:border-foreground"
              >
                Cancelar
              </button>
            </div>
          </AnimatedForm>
        ) : (
          <motion.button
            key="add-button"
            type="button"
            onClick={startNew}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-border px-5 py-2 text-sm transition-colors duration-200 hover:border-foreground"
          >
            Añadir dirección
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
