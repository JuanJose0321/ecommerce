"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import { updateContactAction, setShippingMethodAction } from "@/app/actions/checkout"
import { estimateShippingByPostalCode } from "@/lib/shipping-estimate"
import { formatPrice } from "@/lib/format"
import { AnimatedForm } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { SubmitButton } from "@/components/ui/submit-button"
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
  const [shippingError, setShippingError] = useState<string | null>(null)

  const estimate = useMemo(
    () => estimateShippingByPostalCode(form.postal_code),
    [form.postal_code]
  )

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOption) {
      setShippingError("Selecciona un método de envío.")
      return
    }
    setShippingError(null)
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
    <AnimatedForm onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-5">
        <h2 className="font-heading text-xl">Contacto y envío</h2>
        <FormField label="Correo" type="email" autoComplete="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre" autoComplete="given-name" required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          <FormField label="Apellido" autoComplete="family-name" required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
        </div>
        <FormField label="Dirección" autoComplete="address-line1" required value={form.address_1} onChange={(e) => update("address_1", e.target.value)} />
        <FormField
          label="Referencias (opcional)"
          autoComplete="address-line2"
          value={form.address_2}
          onChange={(e) => update("address_2", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" autoComplete="address-level2" required value={form.city} onChange={(e) => update("city", e.target.value)} />
          <FormField label="Estado" autoComplete="address-level1" required value={form.province} onChange={(e) => update("province", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Código postal"
            autoComplete="postal-code"
            required
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value.replace(/\D/g, "").slice(0, 5))}
            hint={estimate ? `Zona ${estimate.zone}: estándar ${estimate.standardDays}, exprés ${estimate.expressDays}.` : undefined}
          />
          <FormField label="Teléfono" autoComplete="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-xl">Método de envío</h2>
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 text-sm transition-colors duration-200 ${
              selectedOption === option.id ? "border-foreground" : "border-border hover:border-foreground/40"
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping-option"
                checked={selectedOption === option.id}
                onChange={() => {
                  setSelectedOption(option.id)
                  setShippingError(null)
                }}
                className="accent-foreground"
              />
              {option.name}
            </span>
            <span>{formatPrice(option.amount, cart.currency_code)}</span>
          </label>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          {shippingError ? (
            <motion.p
              key="shipping-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-xs text-destructive"
            >
              {shippingError}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <FormBanner key="form-error" type="error">
            {error}
          </FormBanner>
        ) : null}
      </AnimatePresence>

      <SubmitButton loading={status === "submitting"} loadingText="Guardando..." className="py-3.5">
        Continuar a pago
      </SubmitButton>
    </AnimatedForm>
  )
}
