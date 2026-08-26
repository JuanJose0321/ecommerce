"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"

export function CartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Carrito, ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`}
      className="relative flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      ) : null}
    </button>
  )
}
