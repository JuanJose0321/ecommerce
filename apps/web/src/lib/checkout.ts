import "server-only"
import type { Cart } from "@/lib/cart"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

function authHeaders() {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no está configurada.")
  }
  return {
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    "content-type": "application/json",
  }
}

async function medusaFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const error = new Error(body?.message ?? `Medusa request failed: ${res.status}`)
    ;(error as Error & { status?: number }).status = res.status
    throw error
  }

  return res.json()
}

export type ShippingAddressInput = {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  phone: string
}

export async function setCartContact(
  cartId: string,
  email: string,
  address: ShippingAddressInput
): Promise<Cart> {
  const { cart } = await medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify({
      email,
      shipping_address: { ...address, country_code: "mx" },
    }),
  })
  return cart
}

export type ShippingOption = {
  id: string
  name: string
  amount: number
}

export async function listShippingOptions(cartId: string): Promise<ShippingOption[]> {
  const data = await medusaFetch<{
    shipping_options: { id: string; name: string; calculated_price?: { calculated_amount: number } }[]
  }>(`/store/shipping-options?cart_id=${cartId}`)

  return data.shipping_options.map((o) => ({
    id: o.id,
    name: o.name,
    amount: o.calculated_price?.calculated_amount ?? 0,
  }))
}

export async function setShippingMethod(
  cartId: string,
  optionId: string
): Promise<Cart> {
  const { cart } = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/shipping-methods`,
    { method: "POST", body: JSON.stringify({ option_id: optionId }) }
  )
  return cart
}

export async function applyPromoCode(cartId: string, code: string): Promise<Cart> {
  const { cart } = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/promotions`,
    { method: "POST", body: JSON.stringify({ promo_codes: [code] }) }
  )
  return cart
}

export async function removePromoCode(cartId: string, code: string): Promise<Cart> {
  const { cart } = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/promotions`,
    { method: "DELETE", body: JSON.stringify({ promo_codes: [code] }) }
  )
  return cart
}

export async function initiatePaymentSession(
  cartId: string,
  providerId: "pp_stripe_stripe" | "pp_stripe-oxxo_stripe"
): Promise<{ clientSecret: string; cart: Cart }> {
  const { cart: currentCart } = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}`
  )

  const collectionId =
    currentCart.payment_collection?.id ??
    (
      await medusaFetch<{ payment_collection: { id: string } }>(
        "/store/payment-collections",
        { method: "POST", body: JSON.stringify({ cart_id: cartId }) }
      )
    ).payment_collection.id

  const { payment_collection } = await medusaFetch<{
    payment_collection: {
      payment_sessions: { provider_id: string; data: { client_secret?: string } }[]
    }
  }>(`/store/payment-collections/${collectionId}/payment-sessions`, {
    method: "POST",
    body: JSON.stringify({ provider_id: providerId }),
  })

  const session = payment_collection.payment_sessions
    .slice()
    .reverse()
    .find((s) => s.provider_id === providerId)

  if (!session?.data.client_secret) {
    throw new Error("No se pudo iniciar la sesión de pago.")
  }

  const { cart } = await medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}`)
  return { clientSecret: session.data.client_secret, cart }
}

export type CompletedOrder = {
  id: string
  display_id: number
  email: string
  total: number
  currency_code: string
  items: { id: string; title: string; thumbnail: string | null; quantity: number }[]
  payment_status?: string
  fulfillment_status?: string
}

export async function getOrder(orderId: string): Promise<CompletedOrder | null> {
  try {
    const { order } = await medusaFetch<{ order: CompletedOrder }>(
      `/store/orders/${orderId}?fields=id,display_id,email,total,currency_code,*items,payment_status,fulfillment_status`
    )
    return order
  } catch {
    return null
  }
}

export async function completeCart(
  cartId: string
): Promise<
  | { ok: true; order: CompletedOrder }
  | { ok: false; message: string }
> {
  const data = await medusaFetch<
    | { type: "order"; order: CompletedOrder }
    | { type: "cart"; error?: { message: string }; cart?: unknown }
  >(`/store/carts/${cartId}/complete`, { method: "POST" })

  if (data.type === "order") {
    return { ok: true, order: data.order }
  }

  return {
    ok: false,
    message: data.error?.message ?? "El carrito no se pudo completar. Verifica el stock e intenta de nuevo.",
  }
}
