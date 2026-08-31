"use client"

import { ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
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
      <motion.span
        key={itemCount}
        initial={{ scale: itemCount > 0 ? 1.3 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="flex"
      >
        <ShoppingBag className="size-5" />
      </motion.span>
      {itemCount > 0 ? (
        <motion.span
          key={`badge-${itemCount}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </motion.span>
      ) : null}
    </button>
  )
}
