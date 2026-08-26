"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import {
  addCustomerAddress,
  clearSessionToken,
  completePasswordReset,
  deleteCustomerAddress,
  loginCustomer,
  registerCustomer,
  requestPasswordReset,
  updateCustomerAddress,
} from "@/lib/auth"
import { getRequestKey, isRateLimited } from "@/lib/rate-limit"

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export async function loginAction(
  input: z.infer<typeof LoginSchema>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Revisa tu correo y contrasena." }
  }

  const key = `login:${await getRequestKey()}`
  if (isRateLimited(key, { limit: 5, windowMs: 60_000 })) {
    return { ok: false, message: "Demasiados intentos. Espera un minuto e intenta de nuevo." }
  }

  const result = await loginCustomer(parsed.data.email, parsed.data.password)
  if (result.ok) revalidatePath("/", "layout")
  return result
}

const RegisterSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  firstName: z.string().trim().min(1, "Tu nombre es requerido."),
  lastName: z.string().trim().min(1, "Tu apellido es requerido."),
})

export async function registerAction(
  input: z.infer<typeof RegisterSchema>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    }
  }

  const key = `register:${await getRequestKey()}`
  if (isRateLimited(key, { limit: 5, windowMs: 60_000 })) {
    return { ok: false, message: "Demasiados intentos. Espera un minuto e intenta de nuevo." }
  }

  const result = await registerCustomer(
    parsed.data.email,
    parsed.data.password,
    parsed.data.firstName,
    parsed.data.lastName
  )
  if (result.ok) revalidatePath("/", "layout")
  return result
}

const ForgotPasswordSchema = z.object({ email: z.string().trim().email() })

export async function forgotPasswordAction(
  input: z.infer<typeof ForgotPasswordSchema>
): Promise<{ ok: true }> {
  const parsed = ForgotPasswordSchema.safeParse(input)
  if (parsed.success) {
    const key = `forgot-password:${await getRequestKey()}`
    if (!isRateLimited(key, { limit: 5, windowMs: 60_000 })) {
      await requestPasswordReset(parsed.data.email)
    }
  }
  // Always return ok, whether or not the email exists or was rate limited -
  // never reveal account existence through this form.
  return { ok: true }
}

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
})

export async function resetPasswordAction(
  input: z.infer<typeof ResetPasswordSchema>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = ResetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    }
  }

  return completePasswordReset(parsed.data.token, parsed.data.password)
}

export async function logoutAction() {
  await clearSessionToken()
  revalidatePath("/", "layout")
}

const AddressSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  address_1: z.string().trim().min(1),
  address_2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1),
  province: z.string().trim().min(1),
  postal_code: z.string().trim().min(4).max(10),
  country_code: z.literal("mx"),
  phone: z.string().trim().min(10),
})

export async function addAddressAction(
  input: z.infer<typeof AddressSchema>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = AddressSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos de la direccion." }
  }

  const result = await addCustomerAddress(parsed.data)
  if (result.ok) revalidatePath("/account/addresses")
  return result
}

export async function updateAddressAction(
  addressId: string,
  input: z.infer<typeof AddressSchema>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = AddressSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos de la direccion." }
  }

  const result = await updateCustomerAddress(addressId, parsed.data)
  if (result.ok) revalidatePath("/account/addresses")
  return result
}

export async function deleteAddressAction(
  addressId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await deleteCustomerAddress(addressId)
  if (result.ok) revalidatePath("/account/addresses")
  return result
}
