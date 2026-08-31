"use client"

import Image from "next/image"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import { applyPromoCodeAction, removePromoCodeAction } from "@/app/actions/checkout"
import { PromoCodeForm } from "@/components/promo-code-form"
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
  const handleApply = async (code: string) => {
    try {
      const result = await applyPromoCodeAction(code)
      if (result.ok) {
        onCartUpdate(result.cart)
        toast.success("Cupón aplicado")
        return { ok: true }
      }
      toast.error(result.message)
      return { ok: false, message: result.message }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
      return { ok: false, message: NETWORK_ERROR_MESSAGE }
    }
  }

  const handleRemove = async (promoCode: string) => {
    try {
      const result = await removePromoCodeAction(promoCode)
      if (result.ok) {
        onCartUpdate(result.cart)
        toast.success("Cupón eliminado")
      }
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
        <PromoCodeForm
          promotions={cart.promotions}
          onApply={handleApply}
          onRemove={handleRemove}
          className="border-t border-border pt-4"
        />
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
