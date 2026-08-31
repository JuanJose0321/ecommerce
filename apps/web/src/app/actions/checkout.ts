"use server"

import { z } from "zod"
import { clearCartId, getCartId, type Cart } from "@/lib/cart"
import { getRequestKey, isRateLimited } from "@/lib/rate-limit"
import {
  applyPromoCode,
  completeCart,
  initiatePaymentSession,
  removePromoCode,
  setCartContact,
  setShippingMethod,
  type CompletedOrder,
} from "@/lib/checkout"

type ActionResult<T = { cart: Cart }> =
  | ({ ok: true } & T)
  | { ok: false; message: string }

const ContactSchema = z.object({
  email: z.string().trim().email(),
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  address_1: z.string().trim().min(1),
  address_2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1),
  province: z.string().trim().min(1),
  postal_code: z.string().trim().regex(/^\d{5}$/, "Código postal inválido"),
  phone: z.string().trim().min(10),
})

export async function updateContactAction(
  input: z.infer<typeof ContactSchema>
): Promise<ActionResult> {
  const parsed = ContactSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }

  try {
    const { email, ...address } = parsed.data
    const cart = await setCartContact(cartId, email, address)
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "No se pudo guardar tu dirección." }
  }
}

export async function setShippingMethodAction(
  optionId: string
): Promise<ActionResult> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }

  try {
    const cart = await setShippingMethod(cartId, optionId)
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "No se pudo seleccionar el método de envío." }
  }
}

export async function applyPromoCodeAction(code: string): Promise<ActionResult> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }
  if (!code.trim()) return { ok: false, message: "Ingresa un código." }

  const key = `promo:${await getRequestKey()}`
  if (isRateLimited(key, { limit: 10, windowMs: 60_000 })) {
    return { ok: false, message: "Demasiados intentos. Espera un minuto e intenta de nuevo." }
  }

  try {
    const cart = await applyPromoCode(cartId, code.trim().toUpperCase())
    const applied = cart.promotions.some(
      (p) => p.code?.toUpperCase() === code.trim().toUpperCase()
    )
    if (!applied) {
      return { ok: false, message: "Cupón inválido o expirado." }
    }
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "Cupón inválido o expirado." }
  }
}

export async function removePromoCodeAction(code: string): Promise<ActionResult> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }

  try {
    const cart = await removePromoCode(cartId, code)
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "No se pudo quitar el cupón." }
  }
}

export async function initiatePaymentAction(
  providerId: "pp_stripe_stripe" | "pp_stripe-oxxo_stripe"
): Promise<ActionResult<{ clientSecret: string }>> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }

  try {
    const { clientSecret } = await initiatePaymentSession(cartId, providerId)
    return { ok: true, clientSecret }
  } catch {
    return { ok: false, message: "No se pudo iniciar el pago. Intenta de nuevo." }
  }
}

export async function completeOrderAction(): Promise<
  { ok: true; order: CompletedOrder } | { ok: false; message: string }
> {
  const cartId = await getCartId()
  if (!cartId) return { ok: false, message: "Tu carrito está vacío." }

  const result = await completeCart(cartId)
  if (result.ok) {
    await clearCartId()
  }
  return result
}
