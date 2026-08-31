"use server"

import { z } from "zod"
import {
  addLineItem,
  removeLineItem,
  updateLineItemQuantity,
  type Cart,
} from "@/lib/cart"

const AddToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
})

export async function addToCartAction(
  input: z.infer<typeof AddToCartSchema>
): Promise<{ ok: true; cart: Cart } | { ok: false; message: string }> {
  const parsed = AddToCartSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Datos de producto inválidos." }
  }

  try {
    const cart = await addLineItem(parsed.data.variantId, parsed.data.quantity)
    return { ok: true, cart }
  } catch (err) {
    if ((err as Error & { code?: string }).code === "insufficient_inventory") {
      return { ok: false, message: "Ese producto se agotó justo ahora." }
    }
    return { ok: false, message: "No se pudo añadir el producto al carrito." }
  }
}

const UpdateQuantitySchema = z.object({
  lineItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
})

export async function updateCartItemAction(
  input: z.infer<typeof UpdateQuantitySchema>
): Promise<{ ok: true; cart: Cart } | { ok: false; message: string }> {
  const parsed = UpdateQuantitySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Cantidad inválida." }
  }

  try {
    const cart = await updateLineItemQuantity(
      parsed.data.lineItemId,
      parsed.data.quantity
    )
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "No se pudo actualizar la cantidad." }
  }
}

export async function removeCartItemAction(
  lineItemId: string
): Promise<{ ok: true; cart: Cart } | { ok: false; message: string }> {
  if (!lineItemId) {
    return { ok: false, message: "Producto inválido." }
  }

  try {
    const cart = await removeLineItem(lineItemId)
    return { ok: true, cart }
  } catch {
    return { ok: false, message: "No se pudo eliminar el producto." }
  }
}
