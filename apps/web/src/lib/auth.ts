import "server-only"
import { cookies } from "next/headers"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const SESSION_COOKIE = "session_token"

export type CustomerAddress = {
  id: string
  first_name: string | null
  last_name: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country_code: string | null
  phone: string | null
  is_default_shipping: boolean
}

export type Customer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  addresses: CustomerAddress[]
}

function authHeaders(token?: string) {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no está configurada.")
  }
  return {
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    "content-type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionToken() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  const token = await getSessionToken()
  if (!token) return null

  let res: Response
  try {
    res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
      headers: authHeaders(token),
      cache: "no-store",
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  const data = await res.json()
  return data.customer
}

export async function registerCustomer(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const registerRes = await fetch(
    `${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    }
  )

  if (!registerRes.ok) {
    return { ok: false, message: "Ese correo ya está registrado." }
  }

  const { token: registrationToken } = await registerRes.json()

  const customerRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
    method: "POST",
    headers: authHeaders(registrationToken),
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
    }),
  })

  if (!customerRes.ok) {
    return { ok: false, message: "No se pudo crear la cuenta." }
  }

  const loginRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })

  if (!loginRes.ok) {
    return { ok: false, message: "Cuenta creada, pero no se pudo iniciar sesión." }
  }

  const { token } = await loginRes.json()
  await setSessionToken(token)
  return { ok: true }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/reset-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ identifier: email }),
  }).catch(() => {
    // Intentionally ignore network errors here too: never reveal whether an
    // email exists in the system either way.
  })
}

export async function completePasswordReset(
  token: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ password }),
  })

  if (!res.ok) {
    return { ok: false, message: "El enlace expiró o ya se usó. Solicita uno nuevo." }
  }

  return { ok: true }
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return { ok: false, message: "Correo o contraseña incorrectos." }
  }

  const { token } = await res.json()
  await setSessionToken(token)
  return { ok: true }
}

export async function addCustomerAddress(
  input: Omit<CustomerAddress, "id" | "is_default_shipping">
): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = await getSessionToken()
  if (!token) return { ok: false, message: "Sesión expirada." }

  const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  })

  if (!res.ok) return { ok: false, message: "No se pudo guardar la dirección." }
  return { ok: true }
}

export async function updateCustomerAddress(
  addressId: string,
  input: Omit<CustomerAddress, "id" | "is_default_shipping">
): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = await getSessionToken()
  if (!token) return { ok: false, message: "Sesión expirada." }

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(input),
    }
  )

  if (!res.ok) return { ok: false, message: "No se pudo actualizar la dirección." }
  return { ok: true }
}

export async function deleteCustomerAddress(
  addressId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = await getSessionToken()
  if (!token) return { ok: false, message: "Sesión expirada." }

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`,
    { method: "DELETE", headers: authHeaders(token) }
  )

  if (!res.ok) return { ok: false, message: "No se pudo eliminar la dirección." }
  return { ok: true }
}

export type CustomerOrder = {
  id: string
  display_id: number
  created_at: string
  status: string
  fulfillment_status: string
  total: number
  currency_code: string
  items: { id: string; title: string; thumbnail: string | null; quantity: number }[]
}

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const token = await getSessionToken()
  if (!token) return []

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/orders?fields=id,display_id,created_at,status,fulfillment_status,total,currency_code,*items`,
    { headers: authHeaders(token), cache: "no-store" }
  )

  if (!res.ok) return []

  const data = await res.json()
  return data.orders
}
