"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { toast } from "sonner"
import {
  addToCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/app/actions/cart"
import {
  applyPromoCodeAction,
  removePromoCodeAction,
} from "@/app/actions/checkout"
import type { Cart } from "@/lib/cart"

type CartContextValue = {
  cart: Cart | null
  itemCount: number
  isOpen: boolean
  isPending: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity: number) => Promise<{ ok: boolean; message?: string }>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  applyPromoCode: (code: string) => Promise<{ ok: boolean; message?: string }>
  removePromoCode: (code: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)
const NETWORK_ERROR_MESSAGE = "Error de red. Revisa tu conexión e intenta de nuevo."

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null
  children: React.ReactNode
}) {
  const [cart, setCart] = useState(initialCart)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    setIsPending(true)
    try {
      const result = await addToCartAction({ variantId, quantity })
      if (result.ok) {
        setCart(result.cart)
        setIsOpen(true)
        toast.success("Producto añadido al carrito")
        return { ok: true }
      }
      toast.error(result.message)
      return { ok: false, message: result.message }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
      return { ok: false, message: NETWORK_ERROR_MESSAGE }
    } finally {
      setIsPending(false)
    }
  }, [])

  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    setIsPending(true)
    try {
      const result = await updateCartItemAction({ lineItemId, quantity })
      if (result.ok) {
        setCart(result.cart)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }, [])

  const removeItem = useCallback(async (lineItemId: string) => {
    setIsPending(true)
    try {
      const result = await removeCartItemAction(lineItemId)
      if (result.ok) {
        setCart(result.cart)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }, [])

  const applyPromoCode = useCallback(async (code: string) => {
    setIsPending(true)
    try {
      const result = await applyPromoCodeAction(code)
      if (result.ok) {
        setCart(result.cart)
        return { ok: true }
      }
      return { ok: false, message: result.message }
    } catch {
      return { ok: false, message: NETWORK_ERROR_MESSAGE }
    } finally {
      setIsPending(false)
    }
  }, [])

  const removePromoCode = useCallback(async (code: string) => {
    setIsPending(true)
    try {
      const result = await removePromoCodeAction(code)
      if (result.ok) {
        setCart(result.cart)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error(NETWORK_ERROR_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isOpen,
        isPending,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}
