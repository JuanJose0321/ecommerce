import "server-only"
import { cookies } from "next/headers"
import { getDefaultRegionId } from "@/lib/medusa"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

const CART_COOKIE = "cart_id"

export type CartLineItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
  thumbnail: string | null
  variant_id: string
  variant_title: string | null
}

export type CartAddress = {
  first_name: string | null
  last_name: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
}

export type CartPromotion = {
  code: string | null
}

export type Cart = {
  id: string
  currency_code: string
  email: string | null
  subtotal: number
  total: number
  item_total: number
  shipping_total: number
  tax_total: number
  discount_total: number
  items: CartLineItem[]
  shipping_address: CartAddress | null
  shipping_methods: { id: string; shipping_option_id: string; amount: number }[]
  promotions: CartPromotion[]
  payment_collection: { id: string } | null
}

function authHeaders() {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no esta configurada.")
  }
  return {
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    "content-type": "application/json",
  }
}

async function medusaCartFetch(
  path: string,
  init: RequestInit = {}
): Promise<{ cart: Cart }> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const error = new Error(body?.message ?? `Medusa cart request failed: ${res.status}`)
    ;(error as Error & { code?: string }).code = body?.code
    throw error
  }

  return res.json()
}

async function createCart(): Promise<Cart> {
  const regionId = await getDefaultRegionId()
  const { cart } = await medusaCartFetch("/store/carts", {
    method: "POST",
    body: JSON.stringify({ region_id: regionId }),
  })
  return cart
}

export async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value ?? null
}

export async function clearCartId() {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
}

async function persistCartId(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function getOrCreateCart(): Promise<Cart> {
  const existingId = await getCartId()

  if (existingId) {
    try {
      const { cart } = await medusaCartFetch(`/store/carts/${existingId}`)
      return cart
    } catch {
      // cart_id cookie points to a cart that no longer exists (e.g. completed
      // into an order, or a stale/expired id): fall through and create a new one.
    }
  }

  const cart = await createCart()
  await persistCartId(cart.id)
  return cart
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  try {
    const { cart } = await medusaCartFetch(`/store/carts/${cartId}`)
    return cart
  } catch {
    return null
  }
}

export async function addLineItem(
  variantId: string,
  quantity: number
): Promise<Cart> {
  const cart = await getOrCreateCart()
  const { cart: updated } = await medusaCartFetch(
    `/store/carts/${cart.id}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  )
  return updated
}

export async function updateLineItemQuantity(
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const cart = await getOrCreateCart()
  const { cart: updated } = await medusaCartFetch(
    `/store/carts/${cart.id}/line-items/${lineItemId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }
  )
  return updated
}

export async function removeLineItem(lineItemId: string): Promise<Cart> {
  const cart = await getOrCreateCart()
  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/carts/${cart.id}/line-items/${lineItemId}`,
    { method: "DELETE", headers: authHeaders(), cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error(`Medusa cart request failed: ${res.status}`)
  }

  const data = await res.json()
  return data.parent
}
