"use client"

import { useId, useMemo, useState } from "react"
import { updateContactAction, setShippingMethodAction } from "@/app/actions/checkout"
import { estimateShippingByPostalCode } from "@/lib/shipping-estimate"
import { formatPrice } from "@/lib/format"
import type { Cart } from "@/lib/cart"
import type { ShippingOption } from "@/lib/checkout"

type FormState = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  phone: string
}

export function ShippingStep({
  cart,
  shippingOptions,
  onComplete,
}: {
  cart: Cart
  shippingOptions: ShippingOption[]
  onComplete: (cart: Cart) => void
}) {
  const [form, setForm] = useState<FormState>({
    email: cart.email ?? "",
    first_name: cart.shipping_address?.first_name ?? "",
    last_name: cart.shipping_address?.last_name ?? "",
    address_1: cart.shipping_address?.address_1 ?? "",
    address_2: cart.shipping_address?.address_2 ?? "",
    city: cart.shipping_address?.city ?? "",
    province: cart.shipping_address?.province ?? "",
    postal_code: cart.shipping_address?.postal_code ?? "",
    phone: cart.shipping_address?.phone ?? "",
  })
  const [selectedOption, setSelectedOption] = useState(
    cart.shipping_methods[0]?.shipping_option_id ?? shippingOptions[0]?.id ?? ""
  )
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const estimate = useMemo(
    () => estimateShippingByPostalCode(form.postal_code),
    [form.postal_code]
  )

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      setError("Selecciona un metodo de envio.")
      return
    }
    setStatus("submitting")
    setError(null)

    const contactResult = await updateContactAction(form)
    if (!contactResult.ok) {
      setStatus("error")
      setError(contactResult.message)
      return
    }

    const shippingResult = await setShippingMethodAction(selectedOption)
    if (!shippingResult.ok) {
      setStatus("error")
      setError(shippingResult.message)
      return
    }

    onComplete(shippingResult.cart)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-heading text-xl">Contacto y envio</h2>
        <Field label="Correo" type="email" value={form.email} onChange={(v) => update("email", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={form.first_name} onChange={(v) => update("first_name", v)} />
          <Field label="Apellido" value={form.last_name} onChange={(v) => update("last_name", v)} />
        </div>
        <Field label="Direccion" value={form.address_1} onChange={(v) => update("address_1", v)} />
        <Field
          label="Referencias (opcional)"
          required={false}
          value={form.address_2}
          onChange={(v) => update("address_2", v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ciudad" value={form.city} onChange={(v) => update("city", v)} />
          <Field label="Estado" value={form.province} onChange={(v) => update("province", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Field
              label="Codigo postal"
              value={form.postal_code}
              onChange={(v) => update("postal_code", v.replace(/\D/g, "").slice(0, 5))}
            />
            {estimate ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Zona {estimate.zone}: estandar {estimate.standardDays}, exprés {estimate.expressDays}.
              </p>
            ) : null}
          </div>
          <Field label="Telefono" value={form.phone} onChange={(v) => update("phone", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-xl">Metodo de envio</h2>
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center justify-between border p-4 text-sm transition-colors ${
              selectedOption === option.id ? "border-foreground" : "border-border"
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping-option"
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="accent-foreground"
              />
              {option.name}
            </span>
            <span>{formatPrice(option.amount, cart.currency_code)}</span>
          </label>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Guardando..." : "Continuar a pago"}
      </button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
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
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
    </div>
  )
}
