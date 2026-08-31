"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/format"
import { applyPromoCodeAction, removePromoCodeAction } from "@/app/actions/checkout"
import { AnimatePresence } from "@/components/ui/form-banner"
import { SubmitButton } from "@/components/ui/submit-button"
import type { Cart } from "@/lib/cart"

const NETWORK_ERROR_MESSAGE = "Error de red. Revisa tu conexión e intenta de nuevo."

export function OrderSummary({
  cart,
  onCartUpdate,
  showCoupon = true,
}: {
  cart: Cart
  onCartUpdate: (cart: Cart) => void
  showCoupon?: boolean
}) {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "applying" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus("applying")
    setError(null)
    try {
      const result = await applyPromoCodeAction(code)
      if (result.ok) {
        onCartUpdate(result.cart)
        setCode("")
        setStatus("idle")
        toast.success("Cupón aplicado")
      } else {
        setStatus("error")
        setError(result.message)
        toast.error(result.message)
      }
    } catch {
      setStatus("error")
      setError(NETWORK_ERROR_MESSAGE)
      toast.error(NETWORK_ERROR_MESSAGE)
    }
  }

  const handleRemove = async (promoCode: string) => {
    try {
      const result = await removePromoCodeAction(promoCode)
      if (result.ok) onCartUpdate(result.cart)
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-border p-6">
      <h2 className="font-heading text-xl">Resumen del pedido</h2>

      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm">{item.title}</p>
              {item.variant_title ? (
                <p className="text-xs text-muted-foreground">{item.variant_title}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
            </div>
            <p className="text-sm">{formatPrice(item.unit_price * item.quantity, cart.currency_code)}</p>
          </li>
        ))}
      </ul>

      {showCoupon ? (
        <div className="border-t border-border pt-4">
          {cart.promotions.length > 0 ? (
            <ul className="mb-3 space-y-1">
              {cart.promotions.map((p) =>
                p.code ? (
                  <li key={p.code} className="flex items-center justify-between text-sm">
                    <span>Cupón {p.code}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.code!)}
                      aria-label="Quitar cupón"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ) : null
              )}
            </ul>
          ) : null}
          <form onSubmit={handleApply} className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de descuento"
              aria-label="Código de descuento"
              className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground/60 focus:border-foreground"
            />
            <SubmitButton
              loading={status === "applying"}
              loadingText=""
              variant="outline"
              className="w-auto shrink-0 rounded-full px-4 py-2"
            >
              Aplicar
            </SubmitButton>
          </form>
          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.p
                key="coupon-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-2 text-sm text-destructive"
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <div className="space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(cart.item_total, cart.currency_code)}</span>
        </div>
        {cart.discount_total > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Descuento</span>
            <span>-{formatPrice(cart.discount_total, cart.currency_code)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span>
            {cart.shipping_total > 0
              ? formatPrice(cart.shipping_total, cart.currency_code)
              : "Por calcular"}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(cart.total, cart.currency_code)}</span>
        </div>
      </div>
    </div>
  )
}
