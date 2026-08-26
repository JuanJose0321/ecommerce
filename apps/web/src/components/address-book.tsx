"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  addAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/app/actions/auth"
import type { CustomerAddress } from "@/lib/auth"

function handleSessionExpiry(message: string, router: ReturnType<typeof useRouter>) {
  if (message === "Sesion expirada.") {
    toast.error("Tu sesion expiro. Inicia sesion de nuevo.")
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
    toast.success(editingId ? "Direccion actualizada" : "Direccion guardada")
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
    toast.success("Direccion eliminada")
    router.refresh()
  }

  const isFormOpen = showNewForm || editingId !== null

  return (
    <div className="space-y-6">
      {initialAddresses.length === 0 && !isFormOpen ? (
        <p className="text-sm text-muted-foreground">
          Aun no tienes direcciones guardadas.
        </p>
      ) : null}

      <ul className="space-y-4">
        {initialAddresses.map((address) => (
          <li key={address.id} className="border border-border p-5">
            <p className="text-sm font-medium">
              {address.first_name} {address.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
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
                className="text-xs text-foreground underline"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                className="text-xs text-destructive underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4 border border-border p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={form.first_name} onChange={(v) => setForm((f) => ({ ...f, first_name: v }))} />
            <Field label="Apellido" value={form.last_name} onChange={(v) => setForm((f) => ({ ...f, last_name: v }))} />
          </div>
          <Field label="Direccion" value={form.address_1} onChange={(v) => setForm((f) => ({ ...f, address_1: v }))} />
          <Field label="Referencias (opcional)" required={false} value={form.address_2} onChange={(v) => setForm((f) => ({ ...f, address_2: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
            <Field label="Estado" value={form.province} onChange={(v) => setForm((f) => ({ ...f, province: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Codigo postal" value={form.postal_code} onChange={(v) => setForm((f) => ({ ...f, postal_code: v }))} />
            <Field label="Telefono" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "submitting" ? "Guardando..." : "Guardar direccion"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-foreground"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={startNew}
          className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-foreground"
        >
          Anadir direccion
        </button>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const id = useId()

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
    </div>
  )
}
